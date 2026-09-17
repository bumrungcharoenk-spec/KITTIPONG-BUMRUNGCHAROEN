const fs = require('node:fs');
const path = require('node:path');

const projectRoot = __dirname;
const publicDirectory = path.join(projectRoot, 'public');
const publicFiles = ['index.html', 'styles.css', 'scirpt.js'];

fs.mkdirSync(publicDirectory, { recursive: true });

for (const file of publicFiles) {
  fs.copyFileSync(path.join(projectRoot, file), path.join(publicDirectory, file));
}
