# ↔️ Resizable Sidebar

An [Agent Zero](https://github.com/agent0ai/agent-zero) plugin that adds a draggable resize handle to the left sidebar.

## Features

- **Drag to resize** — grab the right edge of the sidebar and drag to adjust its width (180–500 px)
- **Persistent width** — your chosen width is saved in `localStorage` and restored on page load
- **Double-click to reset** — double-click the handle to snap back to the default 250 px
- **Smooth UX** — transitions are disabled during drag for instant feedback; the handle highlights on hover
- **Mobile-aware** — the resize handle is hidden on viewports ≤ 768 px

## How It Works

The plugin injects a thin (6 px) invisible drag handle at the right edge of the sidebar using the `sidebar-end` extension point. An Alpine.js store manages the drag state, clamps the width, persists it to `localStorage`, and applies it via a dynamic `<style>` element that overrides the sidebar's CSS.

## Installation

1. Install via the **Agent Zero Plugin Hub**, or clone this repo into your `usr/plugins/` directory:
   ```bash
   cd /path/to/agent-zero/usr/plugins/
   git clone https://github.com/nicolasleao/a0-resizable-sidebar-plugin.git resizable_sidebar
   ```
2. Enable the plugin in **Settings → Plugins**
3. Hard-refresh the page (`Ctrl+Shift+R`)

## Plugin Structure

```
resizable_sidebar/
├── plugin.yaml                          # Plugin manifest
├── extensions/
│   └── webui/
│       └── sidebar-end/
│           └── resize-handle.html       # Drag handle + CSS injection
└── webui/
    └── resize-store.js                  # Alpine.js store (drag logic, persistence)
```

## License

MIT
