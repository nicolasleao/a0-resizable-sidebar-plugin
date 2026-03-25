import { createStore } from "/js/AlpineStore.js";

const DEFAULT_WIDTH = 250;
const MIN_WIDTH = 180;
const MAX_WIDTH = 500;
const STORAGE_KEY = "sidebarResizeWidth";

const model = {
  width: DEFAULT_WIDTH,
  dragging: false,
  _initialized: false,
  _observer: null,
  _styleEl: null,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Load persisted width
    const stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!isNaN(stored) && stored >= MIN_WIDTH && stored <= MAX_WIDTH) {
      this.width = stored;
    }

    // Create dynamic style element for CSS overrides
    this._styleEl = document.createElement("style");
    this._styleEl.id = "sidebar-resize-styles";
    document.head.appendChild(this._styleEl);

    // Apply initial width
    this._applyWidth();

    // Watch for .hidden class changes on #left-panel to sync margin-left
    this._watchHiddenClass();

    // Global drag listeners
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onTouchMove = this._handleTouchMove.bind(this);
    this._onTouchEnd = this._handleMouseUp.bind(this);

    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("touchmove", this._onTouchMove, { passive: false });
    document.addEventListener("touchend", this._onTouchEnd);
  },

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._styleEl) {
      this._styleEl.remove();
      this._styleEl = null;
    }
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("touchmove", this._onTouchMove);
    document.removeEventListener("touchend", this._onTouchEnd);
    this._initialized = false;
  },

  // Apply the current width to the sidebar via dynamic CSS
  _applyWidth() {
    if (!this._styleEl) return;

    // Use CSS rules to override the sidebar width and hidden margin
    // This avoids fighting with inline styles and transitions
    this._styleEl.textContent = `
      @media (min-width: 769px) {
        #left-panel {
          width: ${this.width}px !important;
          min-width: ${this.width}px !important;
        }
        #left-panel.hidden {
          margin-left: -${this.width}px !important;
        }
      }
    `;
  },

  // Persist width to localStorage
  _persist() {
    localStorage.setItem(STORAGE_KEY, String(this.width));
  },

  // Watch for .hidden class toggling to ensure smooth transitions
  _watchHiddenClass() {
    const panel = document.getElementById("left-panel");
    if (!panel) {
      // Panel might not be rendered yet; retry shortly
      setTimeout(() => this._watchHiddenClass(), 200);
      return;
    }
    // MutationObserver to re-apply width when class changes
    this._observer = new MutationObserver(() => {
      this._applyWidth();
    });
    this._observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
  },

  // Called from the resize handle on mousedown
  startDrag(event) {
    // Skip on mobile
    if (window.innerWidth <= 768) return;
    // Only prevent default for mouse events (touch uses passive listener)
    if (event.type === "mousedown") event.preventDefault();
    this.dragging = true;

    // Disable transitions during drag for smooth resize
    const panel = document.getElementById("left-panel");
    if (panel) {
      panel.style.transition = "none";
    }

    // Prevent text selection during drag
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.cursor = "col-resize";
  },

  _handleMouseMove(event) {
    if (!this.dragging) return;
    event.preventDefault();
    const clientX = event.clientX;
    this._updateWidth(clientX);
  },

  _handleTouchMove(event) {
    if (!this.dragging) return;
    if (event.touches && event.touches.length > 0) {
      event.preventDefault();
      this._updateWidth(event.touches[0].clientX);
    }
  },

  _handleMouseUp() {
    if (!this.dragging) return;
    this.dragging = false;

    // Re-enable transitions
    const panel = document.getElementById("left-panel");
    if (panel) {
      panel.style.transition = "";
    }

    // Restore normal cursor and selection
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.cursor = "";

    // Persist final width
    this._persist();
  },

  _updateWidth(clientX) {
    const newWidth = Math.round(Math.min(Math.max(clientX, MIN_WIDTH), MAX_WIDTH));
    if (newWidth !== this.width) {
      this.width = newWidth;
      this._applyWidth();
    }
  },

  // Reset to default width
  resetWidth() {
    this.width = DEFAULT_WIDTH;
    this._applyWidth();
    this._persist();
  },
};

export const store = createStore("sidebarResize", model);
