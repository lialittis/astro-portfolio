# Hacker Theme Usage Guide

This guide explains how to use the reusable hacker theme components on any page in your Astro project.

## 🎯 Overview

The hacker theme has been refactored into reusable components and styles:

- **Components**: Terminal components for consistent UI
- **Styles**: Global hacker theme in `src/style/hacker-theme.css`
- **Automatic**: Style switching works across all pages

## 📁 Files

### Components
- `src/components/Terminal/TerminalHeader.astro` - Terminal window header with controls
- `src/components/Terminal/CommandLine.astro` - Command line prompt
- `src/components/Terminal/TerminalWrapper.astro` - Terminal container wrapper

### Styles
- `src/style/hacker-theme.css` - All hacker theme styles (automatically applied when `data-style="hacker"`)

## 🚀 How to Use

### 1. Basic Setup

Import the necessary components and styles in your `.astro` page:

```astro
---
import Layout from '../layouts/Layout.astro'
import Card from '../components/Card/index.astro'
import TerminalHeader from '../components/Terminal/TerminalHeader.astro'
import TerminalWrapper from '../components/Terminal/TerminalWrapper.astro'
import CommandLine from '../components/Terminal/CommandLine.astro'
import '../style/hacker-theme.css'
---
```

### 2. Create Terminal Layout

Wrap your content in the terminal components:

```astro
<Layout title="Your Page Title">
  <main class='text-white m-auto p-2 grid gap-2 max-w-6xl'>
    <TerminalWrapper class="hacker-layout">
      <TerminalHeader title="root@yourpage:~$" />
      
      <div class="terminal-content">
        <!-- Your content here -->
      </div>
    </TerminalWrapper>
  </main>
</Layout>
```

### 3. Add Commands and Sections

Use the components to structure your content:

```astro
<div class="terminal-content">
  <!-- Command prompt -->
  <CommandLine command="whoami" />
  
  <!-- Content section -->
  <div class="hacker-intro">
    <Card title="About Me">
      <p>Your content here</p>
    </Card>
  </div>

  <!-- Another command -->
  <CommandLine command="cat projects.json" />
  
  <!-- Grid layout for multiple cards -->
  <div class="hacker-grid">
    <Card title="Project 1">
      <p>Description</p>
    </Card>
    <Card title="Project 2">
      <p>Description</p>
    </Card>
  </div>
</div>
```

## 🎨 Available CSS Classes

### Layout Classes
- `.hacker-layout` - Main terminal wrapper
- `.terminal-content` - Terminal content area
- `.hacker-intro` - Single content section with left border
- `.hacker-section` - Generic content section
- `.hacker-grid` - Grid layout for multiple items

### Automatic Styling
When `body[data-style="hacker"]` is active, these styles are automatically applied:
- All `.card` elements get hacker styling
- Typography (h1-h6, p, span, div) gets terminal colors
- Links get green glow effect
- Buttons get terminal style
- SVG icons get green filter

## 📝 Complete Example

Here's a complete example page using the hacker theme:

```astro
---
import Layout from '../layouts/Layout.astro'
import Card from '../components/Card/index.astro'
import TerminalHeader from '../components/Terminal/TerminalHeader.astro'
import TerminalWrapper from '../components/Terminal/TerminalWrapper.astro'
import CommandLine from '../components/Terminal/CommandLine.astro'
import StyleSwitcher from '../components/StyleSwitcher.astro'
import '../style/hacker-theme.css'
---

<script>
  // Apply style on load and toggle layout visibility
  const style = localStorage.getItem('style') || 'modern';
  document.body.setAttribute('data-style', style);
  
  // Toggle layout visibility immediately to prevent flash
  const hackerLayout = document.querySelector('.hacker-layout');
  const modernLayout = document.querySelector('.modern-layout');
  
  if (style === 'hacker') {
    hackerLayout?.classList.remove('hidden');
    modernLayout?.classList.add('hidden');
  } else {
    hackerLayout?.classList.add('hidden');
    modernLayout?.classList.remove('hidden');
  }
</script>

<StyleSwitcher />

<Layout title="My Projects">
  <main class='text-white m-auto p-2 grid gap-2 max-w-6xl'>
    <!-- Hacker Mode -->
    <TerminalWrapper class="hacker-layout hidden">
      <TerminalHeader title="root@projects:~$" />
      
      <div class="terminal-content">
        <CommandLine command="ls -la ./projects" />
        
        <div class="hacker-intro">
          <Card title="Featured Projects">
            <p>Check out my latest work...</p>
          </Card>
        </div>

        <CommandLine command="cat project_details.json" />
        
        <div class="hacker-grid">
          <Card title="Project Alpha">
            <p>Description of project alpha</p>
          </Card>
          <Card title="Project Beta">
            <p>Description of project beta</p>
          </Card>
        </div>

        <CommandLine command="git log --oneline" />
        
        <div class="hacker-section">
          <Card title="Recent Activity">
            <p>Latest updates...</p>
          </Card>
        </div>
      </div>
    </TerminalWrapper>

    <!-- Modern Mode (optional alternative layout) -->
    <div class="modern-layout hidden">
      <Card title="Projects">
        <p>Modern style content...</p>
      </Card>
    </div>
  </main>
</Layout>

<style>
  .modern-layout {
    display: contents;
  }

  .modern-layout.hidden {
    display: none;
  }
</style>
```

## 🎭 Dual Mode Support

To support both modern and hacker modes on the same page:

1. **Add the toggle script** (runs immediately to prevent flash):

```astro
<script>
  // Apply style on load and toggle layout visibility
  const style = localStorage.getItem('style') || 'modern';
  document.body.setAttribute('data-style', style);
  
  // Toggle layout visibility immediately to prevent flash
  const hackerLayout = document.querySelector('.hacker-layout');
  const modernLayout = document.querySelector('.modern-layout');
  
  if (style === 'hacker') {
    hackerLayout?.classList.remove('hidden');
    modernLayout?.classList.add('hidden');
  } else {
    hackerLayout?.classList.add('hidden');
    modernLayout?.classList.remove('hidden');
  }
</script>
```

2. **Mark hacker layout as hidden by default**:

```astro
<TerminalWrapper class="hacker-layout hidden">
  <!-- content -->
</TerminalWrapper>
```

3. **Mark modern layout as hidden by default**:

```astro
<div class="modern-layout hidden">
  <!-- content -->
</div>
```

The script will remove the `hidden` class from the appropriate layout based on user preference.

## 🔧 Customization

### Custom Terminal Title
```astro
<TerminalHeader title="user@custom:~/path$" />
```

### Custom Commands
```astro
<CommandLine command="npm run build" />
<CommandLine command="./deploy.sh --production" />
<CommandLine command="tail -f logs/app.log" />
```

### Custom Section Styling
Add your own classes alongside the hacker classes for additional styling:

```astro
<div class="hacker-section my-custom-class">
  <!-- Your content -->
</div>
```

## 💡 Tips

1. **Always import** `hacker-theme.css` for automatic styling
2. **Use** `TerminalWrapper` as the outer container
3. **Structure** content with CommandLine components for authenticity
4. **All Cards** automatically get hacker styling when theme is active
5. **No manual styling** needed - the theme handles everything!

## 🎨 Color Reference

- Primary Green: `#00ff41`
- Secondary Green: `#00d639`
- Border Green: `rgba(0, 255, 65, 0.3)`
- Background: `#000000`
- Text: `rgba(0, 255, 65, 0.85)`

## 📚 See Also

- `src/pages/index.astro` - Reference implementation
- `src/style/hacker-theme.css` - Complete style definitions
- `src/components/Terminal/` - Terminal component implementations
