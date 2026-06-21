const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

const walkSync = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    const dirPath = path.join(dir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      walkSync(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
};

const allFiles = [];
walkSync(srcDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    allFiles.push(filePath);
  }
});

const unused = [];

allFiles.forEach(file => {
  if (file.includes('main.jsx') || file.includes('App.jsx')) return;
  const basename = path.basename(file, path.extname(file));
  const regex = new RegExp(`['"\/]${basename}['"\/]|import.*${basename}`, 'g');
  
  let isImported = false;
  for (let otherFile of allFiles) {
    if (otherFile === file) continue;
    const content = fs.readFileSync(otherFile, 'utf8');
    if (regex.test(content) || content.includes(`/${basename}`) || content.includes(`./${basename}`) || content.includes(`../${basename}`)) {
      isImported = true;
      break;
    }
  }

  if (!isImported) {
    unused.push(file);
  }
});

console.log('Potentially unused files:');
unused.forEach(f => console.log(f));
