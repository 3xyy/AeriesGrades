// Update version in manifest.json from version.js
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from version.js
const versionFile = readFileSync(join(__dirname, 'src', 'routes', 'version.js'), 'utf-8');
const versionMatch = versionFile.match(/const VERSION = "(.+)"/);

if (!versionMatch) {
    console.error('Could not find VERSION in version.js');
    process.exit(1);
}

const version = versionMatch[1];

// Update manifest.json
const manifestPath = join(__dirname, '..', 'Extension', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
manifest.version = version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n');

console.log(`✅ Updated manifest.json to version ${version}`);
