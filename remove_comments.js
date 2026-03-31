const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let newLines = [];
  let inBlockComment = false;
  
  for (let line of lines) {
    let trimmed = line.trim();
    if (inBlockComment) {
      if (trimmed.includes('*/') || trimmed.includes('-->') || trimmed.includes('*/}')) {
        inBlockComment = false;
      }
      continue;
    }
    
    // Check for single line comments
    if (trimmed.startsWith('//') || trimmed.startsWith('///')) {
      continue;
    }
    if (trimmed.startsWith('{/*') && trimmed.endsWith('*/}')) {
      continue;
    }
    if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
      continue;
    }
    if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
      continue;
    }
    
    // Check for multi-line block comments start
    if (trimmed.startsWith('/*') && !trimmed.endsWith('*/') && !trimmed.includes('*/')) {
      inBlockComment = true;
      continue;
    }
    if (trimmed.startsWith('<!--') && !trimmed.endsWith('-->') && !trimmed.includes('-->')) {
      inBlockComment = true;
      continue;
    }
    if (trimmed.startsWith('{/*') && !trimmed.endsWith('*/}') && !trimmed.includes('*/}')) {
      inBlockComment = true;
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

processDir(path.join(__dirname, 'src'));
processFile(path.join(__dirname, 'index.html'));
console.log('Removed comments from all files successfully.');
