# Changelog - StreamDesk

## v2.1.8 (2025-11-21)

### 🚀 Performance Improvements

#### Profile Switching Optimization (87-91% faster on mobile)
- **Source-Aware IPC Optimization**:
  - Added `source` parameter tracking ('desktop' | 'mobile')
  - Mobile-initiated switches skip desktop IPC send
  - Workspace profile: 16-17ms → **2.0-2.6ms** (87% faster)
  - Minhas musicas profile: 24-25ms → **2.1-2.3ms** (91% faster)
  - Consistent 2ms response time across all profiles

- **Technical Changes**:
  - `CommandExecutor.execute()` now accepts `source` parameter
  - WebSocket commands tagged as `source='mobile'`
  - Desktop IPC commands tagged as `source='desktop'`
  - Conditional `mainWindow.webContents.send()` based on source
  - Profile loading callback checks source before IPC

- **Architecture**:
  - Mobile → WebSocket → `execute(action, 'mobile')` → skips desktop IPC
  - Desktop → IPC → `onLoadProfile(profile, 'desktop')` → skips desktop IPC
  - Button action → `execute(action, 'desktop')` → broadcasts to all

### ✨ UI Improvements
- **Event Delegation**: Button grid listeners reduced from 90 → 7
- **DocumentFragment Batching**: DOM reflows reduced from 15 → 1
- **Lucide Icon Debounce**: 50ms debounce on 23 icon re-renders

---