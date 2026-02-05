/**
 * PostHTML plugin for includes with named yield slots
 *
 * Usage in page:
 * <include src="components/button.html">
 *   <yield name="text">Click Me</yield>
 *   <yield name="class">btn--primary</yield>
 * </include>
 *
 * Usage in component:
 * <button class="btn <yield name="class">btn--default</yield>">
 *   <yield name="text">Button</yield>
 * </button>
 *
 * Optional yields (render nothing if not provided):
 * <yield name="headline" optional>Default headline</yield>
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import posthtml from 'posthtml';

export default function yieldInclude(options = {}) {
  const root = options.root || process.cwd();
  const encoding = options.encoding || 'utf8';

  return async function plugin(tree) {
    await processTree(tree, root, encoding);
    return tree;
  };
}

// Helper to walk an array/tree and find nodes
function walkNodes(nodes, callback) {
  if (!nodes) return;

  const arr = Array.isArray(nodes) ? nodes : [nodes];

  for (const node of arr) {
    if (node && typeof node === 'object') {
      callback(node);
      if (node.content) {
        walkNodes(node.content, callback);
      }
    }
  }
}

// Find all include nodes in the tree
function findIncludes(nodes) {
  const includes = [];
  walkNodes(nodes, node => {
    // Skip if inside a comment (node.tag will not be 'include' for real includes)
    // Make sure src is a valid string
    if (node.tag === 'include' &&
        node.attrs &&
        typeof node.attrs.src === 'string' &&
        node.attrs.src.length > 0) {
      includes.push(node);
    }
  });
  return includes;
}

async function processTree(tree, root, encoding) {
  // Get the actual array from tree (PostHTML tree can be array-like)
  const nodes = Array.isArray(tree) ? tree : tree;

  // Find all include nodes
  const includeNodes = findIncludes(nodes);

  // Process each include node
  for (const node of includeNodes) {
    await processInclude(node, root, encoding);
  }
}

async function processInclude(node, root, encoding) {
  const src = node.attrs && node.attrs.src;

  // Safety check - skip if src is not a valid string
  if (typeof src !== 'string' || src.length === 0) {
    console.warn('Skipping include with invalid src:', node);
    return;
  }

  const filePath = resolve(root, src);

  let fileContent;
  try {
    fileContent = readFileSync(filePath, encoding);
  } catch (error) {
    console.error(`Could not read file: ${filePath}`);
    return;
  }

  // Extract yields from the include tag's children
  const yields = extractYields(node.content || []);

  // First, process any nested includes in the yield content
  for (const name in yields) {
    const yieldContent = yields[name];
    if (Array.isArray(yieldContent)) {
      await processTree(yieldContent, root, encoding);
    }
  }

  // Pre-process: Replace yields in attribute values (string replacement)
  // This handles cases like class="foo <yield name="class"></yield>"
  fileContent = replaceYieldsInAttributes(fileContent, yields);

  // Parse the included file
  const result = await posthtml().process(fileContent);
  let includedTree = result.tree;

  // Replace yields in the included content with provided content
  replaceYields(includedTree, yields);

  // Now recursively process any includes in the included file
  await processTree(includedTree, root, encoding);

  // Replace the include node with the processed content
  node.tag = false;
  node.attrs = {};
  node.content = includedTree;
}

// Pre-process yields in attribute values via string replacement
// Handles: class="foo <yield name="bar">default</yield>"
// Only matches yields that appear inside attribute values (after =" and before closing ")
function replaceYieldsInAttributes(html, yields) {
  // Match attribute values that contain yield tags
  // Pattern: attribute="...content...<yield name="x">default</yield>...content..."
  const attrPattern = /(\w+)="([^"]*<yield\s+name=["']([^"']+)["'][^>]*>([^<]*)<\/yield>[^"]*)"/g;

  return html.replace(attrPattern, (match, attrName, attrValue, yieldName, defaultContent) => {
    // Replace the yield tag within the attribute value
    const yieldPattern = new RegExp(`<yield\\s+name=["']${yieldName}["'][^>]*>([^<]*)<\\/yield>`, 'g');
    const replacement = yields[yieldName] !== undefined
      ? contentToString(yields[yieldName])
      : defaultContent || '';

    const newAttrValue = attrValue.replace(yieldPattern, replacement);
    return `${attrName}="${newAttrValue}"`;
  });
}

// Convert PostHTML content array to string
function contentToString(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      // Reconstruct HTML tag
      let html = '';
      if (item.tag) {
        html = `<${item.tag}`;
        if (item.attrs) {
          for (const [key, value] of Object.entries(item.attrs)) {
            if (value === true || value === '') {
              html += ` ${key}`;
            } else {
              html += ` ${key}="${value}"`;
            }
          }
        }
        html += '>';
        if (item.content) {
          html += contentToString(item.content);
        }
        html += `</${item.tag}>`;
      } else if (item.content) {
        html += contentToString(item.content);
      }
      return html;
    }
    return '';
  }).join('');
}

function extractYields(content) {
  const yields = {};

  if (!Array.isArray(content)) {
    return yields;
  }

  for (const child of content) {
    if (child && typeof child === 'object' && child.tag === 'yield') {
      const name = child.attrs && child.attrs.name;
      if (name) {
        // Store the content of this yield
        yields[name] = child.content || [];
      }
    }
  }

  return yields;
}

function replaceYields(tree, yields) {
  if (!tree) return;

  const walkArray = (arr) => {
    if (!Array.isArray(arr)) return;

    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];

      if (node && typeof node === 'object') {
        if (node.tag === 'yield') {
          const name = node.attrs && node.attrs.name;
          const isOptional = node.attrs && (node.attrs.optional === '' || node.attrs.optional === 'true' || node.attrs.optional === true);

          if (name && yields[name] !== undefined) {
            // Replace with provided content
            node.tag = false;
            node.attrs = {};
            node.content = yields[name];
          } else if (isOptional) {
            // Optional yield with no content provided - render nothing
            node.tag = false;
            node.attrs = {};
            node.content = [];
          } else {
            // Keep default content (remove yield wrapper)
            node.tag = false;
            node.attrs = {};
            // content stays as default
          }
        }

        // Recurse into children
        if (node.content) {
          walkArray(node.content);
        }
      }
    }
  };

  if (Array.isArray(tree)) {
    walkArray(tree);
  } else if (tree.content) {
    walkArray(tree.content);
  }
}
