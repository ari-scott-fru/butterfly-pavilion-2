import { defineConfig } from 'vite';
import posthtml from 'posthtml';
import yieldInclude from './posthtml-yield-include.js';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const __dirname = import.meta.dirname;

// Get all HTML pages from src/ root
function getPageInputs() {
  const srcDir = resolve(__dirname, 'src');
  const inputs = {};

  try {
    const files = readdirSync(srcDir);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const name = file.replace('.html', '');
        inputs[name] = resolve(srcDir, file);
      }
    });
  } catch (e) {
    // No HTML files found
  }

  return inputs;
}

// Custom Vite plugin to process PostHTML with yield includes
function posthtmlPlugin() {
  return {
    name: 'vite-posthtml-yield',
    enforce: 'pre',

    // Watch component/block/layout HTML files for changes
    configureServer(server) {
      const watchDirs = ['blocks', 'components', 'layouts'].map(
        dir => resolve(__dirname, 'src', dir)
      );

      server.watcher.add(watchDirs);

      server.watcher.on('change', (file) => {
        if (file.endsWith('.html') && (file.includes('blocks') || file.includes('components') || file.includes('layouts'))) {
          // Trigger full page reload when includes change
          server.ws.send({ type: 'full-reload' });
        }
      });
    },

    async transformIndexHtml(html, ctx) {
      try {
        // Process PostHTML with yield includes
        const result = await posthtml([
          yieldInclude({
            root: resolve(__dirname, 'src'),
            encoding: 'utf-8'
          })
        ]).process(html);

        return result.html;
      } catch (error) {
        console.error('PostHTML error:', error);
        throw error;
      }
    }
  };
}

export default defineConfig({
  root: 'src',
  base: '/butterfly-pavilion-2/',
  publicDir: resolve(__dirname, 'public'),

  plugins: [
    posthtmlPlugin()
  ],

  css: {
    preprocessorOptions: {
      scss: {
        // Each component imports variables directly
        // No additionalData needed
      }
    }
  },

  server: {
    open: '/index.html'
  },

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: getPageInputs()
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@blocks': resolve(__dirname, 'src/blocks'),
      '@scss': resolve(__dirname, 'src/scss'),
      '@js': resolve(__dirname, 'src/js')
    }
  }
});
