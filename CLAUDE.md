# Static Prototype Project

This project is a static HTML/SCSS/JS prototyping system designed for fast client review and clean handoff to WordPress/Gutenberg development.

## Quick Start

```bash
npm install
npm run dev     # Start dev server at localhost:5173
npm run build   # Build for production
npm run preview # Preview production build
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Build | Vite | Dev server, bundling, SCSS compilation |
| HTML Includes | posthtml-include | Reusable partials with yield/slot pattern |
| CSS | SCSS | Variables, nesting, WordPress-familiar |
| Animations | GSAP + ScrollTrigger | Scroll and interactive animations |
| Deployment | GitHub Pages | Automatic deployment via Actions |

## Project Structure

```
src/
├── pages/              # Full HTML pages (each becomes a route)
├── blocks/             # Page-level content sections → Gutenberg blocks
│   ├── hero/
│   │   ├── hero.html
│   │   └── _hero.scss
│   ├── cta-banner/
│   └── image-text/
├── components/         # Small reusable UI pieces
│   ├── button/
│   ├── card/
│   └── tag/
├── layouts/            # Page wrappers (header, footer)
├── scss/               # Global styles
│   ├── main.scss       # Entry point
│   ├── _variables.scss # Design tokens
│   ├── _typography.scss
│   ├── _reset.scss
│   └── _utilities.scss
├── js/
│   ├── main.js         # Entry point
│   └── animations/     # GSAP modules
└── assets/             # Images, fonts, etc.
```

## Creating Components

Components are small, reusable UI elements.

### File Structure
```
components/
└── button/
    ├── button.html     # HTML template with yields
    └── _button.scss    # Component styles (underscore prefix)
```

### HTML Template
```html
<!--
  Button Component
  WordPress: Reusable partial or ACF component

  ACF Fields:
  - button_text (text)
  - button_url (url)
  - button_style (select: primary, secondary, outline)
-->
<a href="<yield name="url">#</yield>" class="btn <yield name="class">btn--primary</yield>">
  <yield name="text">Button</yield>
</a>
```

### Usage
```html
<include src="components/button/button.html">
  <yield name="text">Get Tickets</yield>
  <yield name="url">/tickets.html</yield>
  <yield name="class">btn--secondary btn--lg</yield>
</include>
```

### SCSS (add to main.scss imports)
```scss
@use '../components/button/button';
```

## Creating Blocks

Blocks are page-level content sections that map to WordPress Gutenberg blocks.

### File Structure
```
blocks/
└── hero/
    ├── hero.html       # HTML template
    └── _hero.scss      # Block styles
```

### WordPress Mapping
Each block maps directly to an ACF Block:

| Prototype | WordPress |
|-----------|-----------|
| `blocks/hero/` | `acf/hero` |
| `<yield name="headline">` | ACF field: `hero_headline` |
| Block variants via `class` yield | ACF select field |

### Block HTML Template
```html
<!--
  Hero Block
  WordPress: ACF Block - acf/hero

  ACF Fields:
  - hero_headline (text)
  - hero_subheadline (textarea)
  - hero_background_image (image)
  - hero_cta_primary_text (text)
  - hero_cta_primary_url (url)
-->
<section class="hero <yield name="class"></yield>">
  <!-- Block content using yields -->
</section>
```

## Animation System

### Data Attribute Animations
Add animations declaratively with data attributes:

```html
<section data-animate="fade-up">
  <!-- Content fades up on scroll -->
</section>

<div data-animate="fade-in" data-animate-delay="200">
  <!-- Fades in with 200ms delay -->
</div>
```

### Available Animations
- `fade-in` - Fade in place
- `fade-up` - Fade + slide up
- `fade-down` - Fade + slide down
- `fade-left` - Fade + slide from right
- `fade-right` - Fade + slide from left
- `scale-in` - Fade + scale up
- `blur-in` - Fade + blur clear

### Staggered Children
Animate children in sequence:
```html
<div class="grid" data-animate-stagger="0.1">
  <div data-animate="fade-up">Item 1</div>
  <div data-animate="fade-up">Item 2</div>
  <div data-animate="fade-up">Item 3</div>
</div>
```

### Counter Animation
Animate numbers counting up:
```html
<span data-counter="1600" data-counter-suffix="+">0</span>
```

### WordPress Consideration
Animations can be toggled via ACF fields:
```php
if (get_field('enable_animation')) {
    $animation_attr = 'data-animate="fade-up"';
}
```

## SCSS Architecture

### Variables (`_variables.scss`)
All design tokens are defined here and map to WordPress `theme.json`:

- **Colors**: Primary, secondary, neutrals, semantic colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (4px base)
- **Breakpoints**: sm (640), md (768), lg (1024), xl (1280)

### Adding New Variables
```scss
// In _variables.scss
$color-accent: #FF6B6B;

// In theme.json (WordPress)
"color": {
  "palette": [
    { "slug": "accent", "color": "#FF6B6B" }
  ]
}
```

## Creating New Pages

1. Create HTML file in `src/pages/`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Standard head content -->
  <link rel="stylesheet" href="../scss/main.scss">
</head>
<body>
  <include src="layouts/header.html"></include>

  <main id="main-content">
    <!-- Include blocks here -->
    <include src="blocks/hero/hero.html">
      <yield name="headline">Page Title</yield>
    </include>
  </main>

  <include src="layouts/footer.html"></include>

  <script type="module" src="../js/main.js"></script>
</body>
</html>
```

2. Page will automatically be included in build (Vite scans `src/pages/`)

## Deployment

### GitHub Pages (Automatic)

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at `https://username.github.io/repo-name/`

### First-Time Setup

1. Go to repo Settings > Pages
2. Under "Build and deployment", select "GitHub Actions"
3. Push to main to trigger first deploy

### Manual Build

```bash
npm run build
# Output in dist/ folder
```

## WordPress Handoff Checklist

When handing off to WordPress developers:

### 1. Block Inventory
- [ ] List all blocks in `blocks/` folder
- [ ] Document ACF field requirements (in HTML comments)
- [ ] Note any block variants (classes)

### 2. Component Library
- [ ] Document all components
- [ ] Specify where each is used

### 3. Design Tokens
- [ ] Export `_variables.scss` values for `theme.json`
- [ ] Document color palette
- [ ] Document typography scale

### 4. Animations
- [ ] List animation types used
- [ ] Document data attributes
- [ ] Note any blocks with disabled animations

### 5. Assets
- [ ] Provide all images in multiple sizes
- [ ] List required fonts
- [ ] Note any icon libraries

## Common Tasks

### Add a New Component

```bash
mkdir src/components/new-component
touch src/components/new-component/new-component.html
touch src/components/new-component/_new-component.scss
```

Add import to `main.scss`:
```scss
@use '../components/new-component/new-component';
```

### Add a New Block

```bash
mkdir src/blocks/new-block
touch src/blocks/new-block/new-block.html
touch src/blocks/new-block/_new-block.scss
```

Add import to `main.scss`:
```scss
@use '../blocks/new-block/new-block';
```

### Modify Design Tokens

1. Update value in `_variables.scss`
2. Update corresponding styles that use the variable
3. Document change for WordPress `theme.json`

### Add New Animation

1. Add animation preset to `scroll-animations.js`:
```js
const animations = {
  // ... existing
  'new-animation': {
    from: { /* initial state */ },
    to: { /* final state */ }
  }
};
```

2. Use in HTML:
```html
<div data-animate="new-animation">Content</div>
```

## Troubleshooting

### Build fails with SCSS errors
- Check that all imported files exist
- Verify underscore prefix on partial files
- Check for syntax errors in SCSS

### Includes not working
- Verify `src` path is relative to `src/` directory
- Check that posthtml-include plugin is configured

### Animations not triggering
- Ensure GSAP is imported
- Check console for ScrollTrigger registration
- Verify `data-animate` attribute is spelled correctly

### Dev server not updating
- Clear browser cache
- Restart dev server
- Check for Vite HMR errors in console
