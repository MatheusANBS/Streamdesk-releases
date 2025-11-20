const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============= CONFIGURAÇÃO =============
const repoOwner = 'MatheusANBS';
const repoName = 'Streamdesk-releases';

// Caminho para a pasta STREAMDESK (ajuste se necessário)
const streamdeskPath = path.join(__dirname, '..', 'STREAMDESK');
// ========================================

// Função para ler o CHANGELOG e extrair a versão e notas mais recentes
function parseChangelog() {
  const changelogPath = path.join(__dirname, 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    console.error('❌ CHANGELOG.md não encontrado!');
    process.exit(1);
  }

  const content = fs.readFileSync(changelogPath, 'utf8');
  const lines = content.split('\n');
  
  // Extrair versão e data do primeiro release
  const versionMatch = content.match(/##\s+v?([\d.]+)\s+\((\d{4}-\d{2}-\d{2})\)/);
  if (!versionMatch) {
    console.error('❌ Formato de versão não encontrado no CHANGELOG.md');
    console.error('   Formato esperado: ## v2.1.4 (2025-11-11)');
    process.exit(1);
  }

  const version = versionMatch[1];
  const releaseDate = versionMatch[2];
  
  // Extrair notas do release (do primeiro ## até o próximo ## ou fim do arquivo)
  let startIndex = -1;
  let endIndex = content.length;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/##\s+v?[\d.]+\s+\(/)) {
      if (startIndex === -1) {
        startIndex = i;
      } else {
        endIndex = lines.slice(0, i).join('\n').length;
        break;
      }
    }
  }
  
  const releaseNotes = content
    .substring(content.indexOf(lines[startIndex]), endIndex)
    .trim();
  
  return {
    version,
    releaseDate,
    releaseNotes
  };
}

const { version: desktopVersion, releaseDate, releaseNotes } = parseChangelog();
const mobileVersion = desktopVersion; // Mesma versão para ambos

console.log('📦 Preparando release do StreamDesk...\n');
console.log(`📋 Versão: v${desktopVersion} (${releaseDate})`);
console.log(`📥 Pasta STREAMDESK: ${streamdeskPath}\n`);

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
  // Manter o nome original do arquivo (com versão)
  const setupFileName = setupFound; // Ex: StreamDesk Setup 2.1.2.exe
  const desktopDest = path.join(releasesDir, setupFileName);

  fs.copyFileSync(desktopSource, desktopDest);
  const stats = fs.statSync(desktopDest);
  console.log(`✅ Desktop: ${setupFileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   → releases/${setupFileName}`);

  // Copiar latest.yml para auto-update
  const latestYmlSource = path.join(desktopDistPath, 'latest.yml');
  if (fs.existsSync(latestYmlSource)) {
    const latestYmlDest = path.join(releasesDir, 'latest.yml');
    fs.copyFileSync(latestYmlSource, latestYmlDest);
    console.log(`✅ Auto-update: latest.yml`);
    console.log(`   → releases/latest.yml`);
  } else {
    console.log('⚠️  latest.yml não encontrado (necessário para auto-update)');
  }
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
  
  fs.copyFileSync(mobileSource, mobileDest);
  
  const stats = fs.statSync(mobileDest);
  console.log(`✅ Mobile: StreamDesk.apk (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   → releases/StreamDesk.apk`);
} else {
  console.log('⚠️  APK não encontrado em:', releaseFolder);
  console.log('   Execute: cd ../STREAMDESK/streamdeck-mobile && npx expo run:android --variant release');
}

// 3. Criar version.json
const setupFileName = setupFound || 'StreamDesk-Setup.exe';
const versionInfo = {
  desktop: {
    version: desktopVersion,
    url: `https://github.com/${repoOwner}/${repoName}/releases/download/v${desktopVersion}/${encodeURIComponent(setupFileName)}`,
    size: setupFound && fs.existsSync(path.join(releasesDir, setupFileName)) 
      ? fs.statSync(path.join(releasesDir, setupFileName)).size 
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

const versionSitePath = path.join(siteDownloadsDir, 'version.json');
fs.writeFileSync(versionSitePath, JSON.stringify(versionInfo, null, 2));
console.log('✅ version.json criado');
console.log('   → Site/public/downloads/version.json');

console.log('\n📁 Arquivos prontos em: releases/');
if (setupFound) console.log(`   ✓ ${setupFileName}`);
if (apkFound) console.log('   ✓ StreamDesk.apk');
if (fs.existsSync(path.join(releasesDir, 'latest.yml'))) console.log('   ✓ latest.yml');
console.log('\n📁 Arquivo criado no site:');
console.log('   ✓ Site/public/downloads/version.json');

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
  const setupFile = path.join(releasesDir, setupFileName);
  const apkFile = path.join(releasesDir, 'StreamDesk.apk');
  const latestYmlFile = path.join(releasesDir, 'latest.yml');
  
  // Formatar release notes do CHANGELOG para o GitHub (adicionar links de download)
  const formattedNotes = `${releaseNotes}

---

### 📥 Downloads
- **Windows**: [${setupFileName}](https://github.com/${repoOwner}/${repoName}/releases/download/v${desktopVersion}/${encodeURIComponent(setupFileName)})
- **Android**: [StreamDesk.apk](https://github.com/${repoOwner}/${repoName}/releases/download/v${desktopVersion}/StreamDesk.apk)`;

  // Salvar release notes em arquivo temporário para evitar problemas com aspas
  const notesFile = path.join(releasesDir, 'release-notes.md');
  fs.writeFileSync(notesFile, formattedNotes);

  // Preparar lista de arquivos para upload
  let filesToUpload = `"${setupFile}" "${apkFile}"`;
  if (fs.existsSync(latestYmlFile)) {
    filesToUpload += ` "${latestYmlFile}"`;
  }

  // Cria release com os arquivos
  const createCmd = `gh release create "${tag}" ${filesToUpload} --title "${releaseTitle}" --notes-file "${notesFile}" -R ${repoOwner}/${repoName}`;
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
  console.log(`   Arquivos: releases/${setupFileName} e releases/StreamDesk.apk`);
}
