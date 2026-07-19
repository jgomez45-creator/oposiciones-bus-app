const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const markdownDir = path.join(__dirname, '..', 'public', 'markdown');
const bibDir = path.join(__dirname, '..', 'public', 'markdown_bib_4140');
const files = fs.readdirSync(markdownDir).filter(f => f.startsWith('tema-') && f.endsWith('.md'));

console.log('| Tema | Github (Words) | Local (Words) | Bib_4140 (Words) | Diff (Local-Git) | Diff (Bib-Git) |');
console.log('|---|---|---|---|---|---|');

files.forEach(file => {
  const localPath = path.join(markdownDir, file);
  const localContent = fs.readFileSync(localPath, 'utf8');
  const localWords = localContent.trim().split(/\s+/).filter(Boolean).length;

  const bibPath = path.join(bibDir, file);
  let bibWords = 0;
  if (fs.existsSync(bibPath)) {
    const bibContent = fs.readFileSync(bibPath, 'utf8');
    bibWords = bibContent.trim().split(/\s+/).filter(Boolean).length;
  }

  let gitContent = '';
  try {
    gitContent = execSync(`git show origin/main:public/markdown/${file}`, { encoding: 'utf8', stdio: [] });
  } catch (e) {
    // If not found in git
  }
  const gitWords = gitContent ? gitContent.trim().split(/\s+/).filter(Boolean).length : 0;

  console.log(`| ${file} | ${gitWords} | ${localWords} | ${bibWords} | ${localWords - gitWords} | ${bibWords - gitWords} |`);
});
