# Changelog - StreamDesk

## v2.1.9 (2025-11-30)

### 🐛 Bug Fixes

#### Drag & Drop Fix
- **Fixed buttons becoming unclickable after repositioning**:
  - `isDragging` flag was not being reset after drag & drop
  - When grid was re-rendered, `dragend` event fired on destroyed element
  - Added `isDragging = false` reset directly in `handleDrop()` function
  - Buttons are now immediately clickable after repositioning

#### Lucide Icons Fix
- **Fixed infinite recursion in `initLucideIcons()`**:
  - Function was calling itself instead of `lucide.createIcons()`
  - This caused UI freezing after saving button configurations
  - Icons now render correctly with proper debounce

---