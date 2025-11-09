const fs = require('fs');
const path = require('path');

// Caminho para a pasta STREAMDESK
const streamdeskPath = path.join(__dirname, '..', 'STREAMDESK');

console.log('🔍 Verificando arquivos do StreamDesk...\n');

// Verificar pasta STREAMDESK
if (!fs.existsSync(streamdeskPath)) {
  console.error('❌ Pasta STREAMDESK não encontrada!');
  console.error(`   Procurado em: ${streamdeskPath}`);
  process.exit(1);
}

console.log('✅ Pasta STREAMDESK encontrada\n');

// Verificar Setup.exe
const desktopDistPath = path.join(streamdeskPath, 'electron-server', 'dist');
let setupFound = null;

if (fs.existsSync(desktopDistPath)) {
  const files = fs.readdirSync(desktopDistPath);
  setupFound = files.find(file => file.includes('Setup') && file.endsWith('.exe'));
  
  if (setupFound) {
    const setupPath = path.join(desktopDistPath, setupFound);
    const stats = fs.statSync(setupPath);
    console.log(`✅ Setup.exe encontrado: ${setupFound}`);
    console.log(`   Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Local: ${setupPath}`);
  } else {
    console.log('❌ Setup.exe não encontrado');
    console.log(`   Local esperado: ${desktopDistPath}`);
    console.log('   Execute: cd ../STREAMDESK/electron-server && npm run build');
  }
} else {
  console.log('❌ Pasta dist do electron-server não encontrada');
  console.log(`   Local esperado: ${desktopDistPath}`);
}

console.log('');

// Verificar APK
const releaseFolder = path.join(streamdeskPath, 'streamdeck-mobile', 'android', 'app', 'build', 'outputs', 'apk', 'release');
let apkFound = null;

if (fs.existsSync(releaseFolder)) {
  const files = fs.readdirSync(releaseFolder);
  apkFound = files.find(file => file.endsWith('.apk'));
  
  if (apkFound) {
    const apkPath = path.join(releaseFolder, apkFound);
    const stats = fs.statSync(apkPath);
    console.log(`✅ APK encontrado: ${apkFound}`);
    console.log(`   Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Local: ${apkPath}`);
  } else {
    console.log('❌ APK não encontrado');
    console.log(`   Local esperado: ${releaseFolder}`);
    console.log('   Execute: cd ../STREAMDESK/streamdeck-mobile && npx expo run:android --variant release');
  }
} else {
  console.log('❌ Pasta release do Android não encontrada');
  console.log(`   Local esperado: ${releaseFolder}`);
}

console.log('');

// Verificar versões no package.json
const electronPackageJson = path.join(streamdeskPath, 'electron-server', 'package.json');
const mobilePackageJson = path.join(streamdeskPath, 'streamdeck-mobile', 'package.json');

if (fs.existsSync(electronPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(electronPackageJson, 'utf8'));
  console.log(`📦 Versão Desktop (package.json): ${pkg.version}`);
} else {
  console.log('⚠️  package.json do electron-server não encontrado');
}

if (fs.existsSync(mobilePackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(mobilePackageJson, 'utf8'));
  console.log(`📦 Versão Mobile (package.json): ${pkg.version}`);
} else {
  console.log('⚠️  package.json do streamdeck-mobile não encontrado');
}

console.log('');

// Verificar GitHub CLI
try {
  const { execSync } = require('child_process');
  execSync('gh --version', { stdio: 'pipe' });
  console.log('✅ GitHub CLI (gh) instalado');
  
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    console.log('✅ GitHub CLI autenticado');
  } catch {
    console.log('❌ GitHub CLI não autenticado - Execute: gh auth login');
  }
} catch {
  console.log('❌ GitHub CLI (gh) não instalado');
  console.log('   Instale em: https://cli.github.com/');
}

console.log('');

// Resumo
if (setupFound && apkFound) {
  console.log('✅ Todos os arquivos estão prontos para release!');
  console.log('   Execute: npm run release');
} else {
  console.log('⚠️  Alguns arquivos estão faltando. Complete o build antes de fazer a release.');
}
