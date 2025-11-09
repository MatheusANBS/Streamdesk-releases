// config.example.js
// Copie este arquivo para config.js e ajuste conforme necessário

module.exports = {
  // Versões
  desktopVersion: '2.1.0',
  mobileVersion: '1.0.0',
  
  // GitHub
  repoOwner: 'MatheusANBS',
  repoName: 'Streamdesk-releases',
  
  // Caminhos (ajuste se necessário)
  streamdeskPath: '../STREAMDESK',
  
  // Release notes template
  releaseNotes: (desktopVersion, mobileVersion) => `## 🎉 StreamDesk ${desktopVersion}

### 🖥️ Desktop (v${desktopVersion})
- Novos recursos aqui

### 📱 Mobile (v${mobileVersion})
- Novos recursos aqui

### 📥 Downloads
- **Windows**: StreamDesk-Setup.exe
- **Android**: StreamDesk.apk`
};
