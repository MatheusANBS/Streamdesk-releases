# Changelog - StreamDesk

## v2.1.7 (2025-11-19)

### 🚀 Performance Improvements

#### TypeText Optimization (Instant typing)
- **Clipboard-only Method**:
  - Removed SendInput fallback attempts (always failed due to UIPI)
  - Direct clipboard + Ctrl+V approach (99.9% compatibility)
  - Clipboard delay: 100ms → **10ms** (10x faster)
  - Code simplified: ~150 lines → **~35 lines**
  
- **Technical Changes**:
  - Eliminated Windows SendInput API structures
  - Pure SendKeys.SendWait() implementation
  - Removed unnecessary delay loops
  - Instant text paste via clipboard

### ✨ New Features

#### Multiline Text Support
- **Resizable Text Areas**: `<input>` → `<textarea>` with vertical resize
- **Line Breaks**: Full support for Enter key in text fields
- **Meme Creation**: Easily create multiline ASCII art and formatted text
- **Visual Feedback**: 
  - Main field: 6 visible lines
  - Multi-action field: 3 visible lines

### 🔧 Bug Fixes
- **Timeout Resolution**: Fixed "TypeText timeout - killing process" appearing after successful completion
  - Added `hasExited` flag and `clearTimeout()` on process exit
  - Timeout reduced: 30s → 10s
- **Enter Key Fixed**: "Press Enter after typing" now uses SendKeys instead of SendInput (100% reliable)

### 🎨 Interface Improvements
- **Expandable Text Boxes**: Drag to resize vertically
- **Better Typography**: Line-height 1.5 for readability
- **Segoe UI Font**: Consistent with Windows system font

### 💡 Unicode Support
- **Full Unicode via Clipboard**: Braille characters (⠀⠇⠴⠸), emojis, special symbols
- **ASCII Art Compatible**: Supports complex character art
- **International Characters**: All languages and accents preserved

---