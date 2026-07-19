const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const markdownDir = path.join(__dirname, '..', 'public', 'markdown');
const files = fs.readdirSync(markdownDir).filter(f => f.startsWith('tema-') && f.endsWith('.md'));

console.log('| Tema | Líneas Github (origin/main) | Líneas Local (Nuevo) | Diferencia Líneas | Palabras Github | Palabras Local | Diferencia Palabras |');
console.log('|---|---|---|---|---|---|---|');

let totalLinesGit = 0;
let totalLinesLocal = 0;
let totalWordsGit = 0;
let totalWordsLocal = 0;

files.forEach(file => {
  const localPath = path.join(markdownDir, file);
  const localContent = fs.readFileSync(localPath, 'utf8');
  const localLines = localContent.split(/\r?\n/).length;
  const localWords = localContent.trim().split(/\s+/).filter(Boolean).length;

  let gitContent = '';
  try {
    gitContent = execSync(`git show origin/main:public/markdown/${file}`, { encoding: 'utf8', stdio: [] });
  } catch (e) {
    // If not found in git
  }

  const gitLines = gitContent ? gitContent.split(/\r?\n/).length : 0;
  const gitWords = gitContent ? gitContent.trim().split(/\s+/).filter(Boolean).length : 0;

  const diffLines = localLines - gitLines;
  const diffWords = localWords - gitWords;

  totalLinesGit += gitLines;
  totalLinesLocal += localLines;
  totalWordsGit += gitWords;
  totalWordsLocal += localWords;

  console.log(`| ${file} | ${gitLines} | ${localLines} | ${diffLines > 0 ? '+' : ''}${diffLines} | ${gitWords} | ${localWords} | ${diffWords > 0 ? '+' : ''}${diffWords} |`);
});

console.log(`| **TOTAL** | **${totalLinesGit}** | **${totalLinesLocal}** | **${totalLinesLocal - totalLinesGit}** | **${totalWordsGit}** | **${totalWordsLocal}** | **${totalWordsLocal - totalWordsGit}** |`);
