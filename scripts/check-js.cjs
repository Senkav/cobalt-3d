const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const file = path.join(dir, item.name);
    return item.isDirectory() ? walk(file) : file.endsWith('.js') ? [file] : [];
  });
}
const files = walk(path.join(root, 'assets'));
for (const file of files) new vm.Script(fs.readFileSync(file, 'utf8'), { filename: path.relative(root, file) });
let inline = 0;
const html = fs.readFileSync(path.join(root, 'cobalt.html'), 'utf8');
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (match[1].includes('application/octet-stream')) continue;
  new vm.Script(match[2], { filename: 'cobalt.html/script-' + (++inline) });
}
console.log(`PASS: syntax of ${files.length} JS files and ${inline} inline scripts`);
