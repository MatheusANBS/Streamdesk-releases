const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============= CONFIGURAÇÃO =============
const desktopVersion = '2.1.0';
const mobileVersion = '1.0.0';
const repoOwner = 'MatheusANBS';
const repoName = 'Streamdesk-releases';

// Caminho para a pasta STREAMDESK (ajuste se necessário)
const streamdeskPath = path.join(__dirname, '..', 'STREAMDESK');
// ========================================

console.log('📦 Preparando release do StreamDesk...\n');
console.log(`📂 Pasta STREAMDESK: ${streamdeskPath}\n`);

// Verificar se a pasta STREAMDESK existe
if (!fs.existsSync(streamdeskPath)) {
  console.error('❌ Pasta STREAMDESK não encontrada!');
  console.error(`   Procurado em: ${streamdeskPath}`);
  console.error('   Ajuste a variável "streamdeskPath" no script.');
  process.exit(1);
}

// Criar pastas necessárias
const releasesDir = path.join(__dirname, 'releases');
const siteDownloadsDir = path.join(streamdeskPath, 'Site', 'public', 'downloads');

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
  console.log('✅ Pasta releases/ criada');
}

if (!fs.existsSync(siteDownloadsDir)) {
  fs.mkdirSync(siteDownloadsDir, { recursive: true });
  console.log('✅ Pasta Site/public/downloads/ criada');
}

// 1. Copiar Setup.exe
const desktopDistPath = path.join(streamdeskPath, 'electron-server', 'dist');
let setupFound = null;

if (fs.existsSync(desktopDistPath)) {
  const files = fs.readdirSync(desktopDistPath);
  // Procurar por qualquer arquivo .exe que contenha "Setup"
  setupFound = files.find(file => file.includes('Setup') && file.endsWith('.exe'));
}

if (setupFound) {
  const desktopSource = path.join(desktopDistPath, setupFound);
  const desktopDest = path.join(releasesDir, 'StreamDesk-Setup.exe');
  const desktopSiteDest = path.join(siteDownloadsDir, 'StreamDesk-Setup.exe');

  fs.copyFileSync(desktopSource, desktopDest);
  fs.copyFileSync(desktopSource, desktopSiteDest);
  const stats = fs.statSync(desktopDest);
  console.log(`✅ Desktop: StreamDesk-Setup.exe (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   → releases/StreamDesk-Setup.exe`);
  console.log(`   → Site/public/downloads/StreamDesk-Setup.exe`);
} else {
  console.log('⚠️  Setup.exe não encontrado em:', desktopDistPath);
  console.log('   Execute: cd ../STREAMDESK/electron-server && npm run build');
}

// 2. Copiar APK
const releaseFolder = path.join(streamdeskPath, 'streamdeck-mobile', 'android', 'app', 'build', 'outputs', 'apk', 'release');
let apkFound = null;

if (fs.existsSync(releaseFolder)) {
  const files = fs.readdirSync(releaseFolder);
  apkFound = files.find(file => file.endsWith('.apk'));
}

if (apkFound) {
  const mobileSource = path.join(releaseFolder, apkFound);
  const mobileDest = path.join(releasesDir, 'StreamDesk.apk');
  const mobileSiteDest = path.join(siteDownloadsDir, 'StreamDesk.apk');
  
  fs.copyFileSync(mobileSource, mobileDest);
  fs.copyFileSync(mobileSource, mobileSiteDest);
  
  const stats = fs.statSync(mobileDest);
  console.log(`✅ Mobile: StreamDesk.apk (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   → releases/StreamDesk.apk`);
  console.log(`   → Site/public/downloads/StreamDesk.apk`);
} else {
  console.log('⚠️  APK não encontrado em:', releaseFolder);
  console.log('   Execute: cd ../STREAMDESK/streamdeck-mobile && npx expo run:android --variant release');
}

// 3. Criar version.json
const versionInfo = {
  desktop: {
    version: desktopVersion,
    url: `https://github.com/${repoOwner}/${repoName}/releases/download/v${desktopVersion}/StreamDesk-Setup.exe`,
    size: setupFound && fs.existsSync(path.join(releasesDir, 'StreamDesk-Setup.exe')) 
      ? fs.statSync(path.join(releasesDir, 'StreamDesk-Setup.exe')).size 
      : 0,
    releaseDate: new Date().toISOString()
  },
  mobile: {
    version: mobileVersion,
    url: `https://github.com/${repoOwner}/${repoName}/releases/download/v${desktopVersion}/StreamDesk.apk`,
    size: apkFound && fs.existsSync(path.join(releasesDir, 'StreamDesk.apk')) 
      ? fs.statSync(path.join(releasesDir, 'StreamDesk.apk')).size 
      : 0,
    releaseDate: new Date().toISOString()
  }
};

const versionPath = path.join(releasesDir, 'version.json');
const versionSitePath = path.join(siteDownloadsDir, 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
fs.writeFileSync(versionSitePath, JSON.stringify(versionInfo, null, 2));
console.log('✅ version.json criado');
console.log('   → releases/version.json');
console.log('   → Site/public/downloads/version.json');

console.log('\n📁 Arquivos prontos em: releases/');
if (setupFound) console.log('   ✓ StreamDesk-Setup.exe');
if (apkFound) console.log('   ✓ StreamDesk.apk');
console.log('   ✓ version.json');

if (!setupFound || !apkFound) {
  console.log('\n⚠️  Alguns arquivos não foram encontrados. Corrija antes de criar a release.');
  process.exit(1);
}

// 4. Criar release no GitHub
console.log('\n🚀 Criando release no GitHub...');

try {
  // Verifica se gh está instalado
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ GitHub CLI (gh) não encontrado.');
    console.log('   Instale em: https://cli.github.com/');
    console.log('\n📝 Ou faça upload manual:');
    console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new`);
    process.exit(0);
  }

  // Verifica se está autenticado
  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ GitHub CLI não autenticado.');
    console.log('   Execute: gh auth login');
    process.exit(0);
  }

  const tag = `v${desktopVersion}`;
  const releaseTitle = `StreamDesk v${desktopVersion}`;
  
  console.log(`   Tag: ${tag}`);
  console.log(`   Repo: ${repoOwner}/${repoName}`);
  
  // Tenta deletar release existente (ignora erro se não existir)
  try {
    execSync(`gh release delete ${tag} --repo ${repoOwner}/${repoName} --yes`, { stdio: 'pipe' });
    console.log(`   ♻️  Release anterior deletado`);
  } catch (error) {
    // Não existe, tudo certo
  }

  // Cria a release
  const setupFile = path.join(releasesDir, 'StreamDesk-Setup.exe');
  const apkFile = path.join(releasesDir, 'StreamDesk.apk');
  
  const releaseNotes = `## 🎉 StreamDesk ${desktopVersion}

### 🖥️ Desktop (v${desktopVersion})
- 🎨 Aplicar Estilo a Todos os botões
- 🔄 Sincronização de perfis entre desktop e mobile
- 🔍 Busca online mostra nome do aplicativo
- 🌐 Suporte para APIs externas (Steam)

### 📱 Mobile (v${mobileVersion})
- 🎯 Transparência funciona com ação "none"
- 🔄 Sincronização automática de perfis

### 📥 Downloads
- **Windows**: StreamDesk-Setup.exe
- **Android**: StreamDesk.apk`;

  // Salvar release notes em arquivo temporário para evitar problemas com aspas
  const notesFile = path.join(releasesDir, 'release-notes.md');
  fs.writeFileSync(notesFile, releaseNotes);

  // Cria release com os arquivos
  const createCmd = `gh release create "${tag}" "${setupFile}" "${apkFile}" --title "${releaseTitle}" --notes-file "${notesFile}" -R ${repoOwner}/${repoName}`;
  execSync(createCmd, {
    stdio: 'inherit'
  });
  
  // Remove arquivo temporário
  fs.unlinkSync(notesFile);

  console.log('\n✅ Release criado com sucesso!');
  console.log(`   https://github.com/${repoOwner}/${repoName}/releases/tag/${tag}`);
  console.log('\n🌐 Próximo passo:');
  console.log(`   cd ${path.join(streamdeskPath, 'Site')} && npm run build && firebase deploy`);

} catch (error) {
  console.log('\n❌ Erro ao criar release');
  console.error('   Detalhes:', error.message);
  console.log(`   Faça upload manual: https://github.com/${repoOwner}/${repoName}/releases/new`);
  console.log(`   Tag: v${desktopVersion}`);
  console.log('   Arquivos: releases/StreamDesk-Setup.exe e releases/StreamDesk.apk');
}
