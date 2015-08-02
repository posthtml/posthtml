import fs from 'fs';
import path from 'path';

export default {
    file: filePath => fs.readFileSync(path.resolve(__dirname, '../test/', filePath), 'utf8').toString(),
    minifer: str => str.replace(/\n/g, '').replace(/>\s+</g, '><').trim()
};
