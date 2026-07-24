import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const [sqlPath, storageZipPath, projectRoot] = process.argv.slice(2);

if (!sqlPath || !storageZipPath || !projectRoot) {
  throw new Error('Usage: node extract-supabase-backup.mjs <backup.sql> <storage.zip> <project-root>');
}

const sql = fs.readFileSync(sqlPath, 'utf8');

function decodeCopyValue(value) {
  if (value === '\\N') return null;
  return value.replace(/\\(x[0-9a-fA-F]{2}|[0-7]{1,3}|.)/g, (_, code) => {
    if (code.startsWith('x')) return String.fromCharCode(Number.parseInt(code.slice(1), 16));
    if (/^[0-7]+$/.test(code)) return String.fromCharCode(Number.parseInt(code, 8));
    return ({
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\v',
      '\\': '\\',
    })[code] ?? code;
  });
}

function readCopyBlock(tableName) {
  const marker = `COPY ${tableName} (`;
  const start = sql.indexOf(marker);
  if (start < 0) throw new Error(`COPY block not found: ${tableName}`);
  const dataStart = sql.indexOf('\n', start) + 1;
  const dataEnd = sql.indexOf('\n\\.\n', dataStart);
  if (dataEnd < 0) throw new Error(`COPY block terminator not found: ${tableName}`);
  return sql
    .slice(dataStart, dataEnd)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split('\t').map(decodeCopyValue));
}

const contentRows = readCopyBlock('public.content');
const content = contentRows.map((columns) => {
  const [
    id,
    type,
    category,
    title,
    data,
    isPublished,
    createdAt,
    updatedAt,
    createdBy,
    language,
  ] = columns;

  return {
    id,
    type,
    category,
    title,
    data: JSON.parse(data.replaceAll('\u0002', '-')),
    is_published: isPublished === 't',
    created_at: createdAt,
    updated_at: updatedAt,
    created_by: createdBy,
    language,
  };
});

const imageRows = readCopyBlock('public.images');
const images = imageRows.map((columns) => {
  const [
    id,
    filename,
    filePath,
    ,
    fileType,
    fileSize,
    altText,
    caption,
    uploadedBy,
    uploadedAt,
  ] = columns;

  return {
    id,
    filename,
    file_path: filePath,
    file_url: `/assets/supabase/${filePath}`,
    file_type: fileType,
    file_size: Number(fileSize || 0),
    alt_text: altText,
    caption,
    uploaded_by: uploadedBy,
    uploaded_at: uploadedAt,
  };
});

const dataDir = path.join(projectRoot, 'src', 'app', 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(
  path.join(dataDir, 'supabase-content.json'),
  `${JSON.stringify(content, null, 2)}\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(dataDir, 'supabase-images.json'),
  `${JSON.stringify(images, null, 2)}\n`,
  'utf8',
);

const extractionRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-storage-'));
execFileSync('tar.exe', ['-xf', storageZipPath, '-C', extractionRoot], { stdio: 'inherit' });

const archiveRoot = path.join(
  extractionRoot,
  'vyrpnyovhpcyvvagcoyl',
  'make-55b791b3-images',
);
const assetsRoot = path.join(projectRoot, 'public', 'assets', 'supabase');
fs.mkdirSync(assetsRoot, { recursive: true });

for (const directory of ['images', 'uploads']) {
  const source = path.join(archiveRoot, directory);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(assetsRoot, directory), { recursive: true });
  }
}

const grouped = Object.groupBy(content, (entry) => `${entry.type}:${entry.language}`);
const summary = Object.fromEntries(
  Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, entries]) => [key, entries.length]),
);

console.log(JSON.stringify({
  contentRows: content.length,
  imageRows: images.length,
  copiedAssets: fs.readdirSync(assetsRoot, { recursive: true }).length,
  summary,
}, null, 2));
