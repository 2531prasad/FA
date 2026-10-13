import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MAX_PDF = 25 * 1024 * 1024;
export const MAX_MARKDOWN = 2 * 1024 * 1024;
export const CONVERTED_DIRECTORY = 'Converted';
const fail = (status, message) => Object.assign(new Error(message), {status});

export function createPdfConverter({python = process.env.MARKITDOWN_PYTHON || path.join(HERE, '.venv-markitdown', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'), timeout = 120_000} = {}) {
  let busy = false;
  function run(data, check = false, signal) {
    return new Promise((resolve, reject) => {
      const child = execFile(python, ['-I', path.join(HERE, 'tools/convert_pdf.py'), ...(check ? ['--check'] : [])], {
        timeout: check ? 15_000 : timeout, maxBuffer: 16 * 1024 * 1024,
        killSignal: 'SIGKILL', signal, windowsHide: true,
        env: {PATH: process.env.PATH || '', ...(process.env.SystemRoot ? {SystemRoot: process.env.SystemRoot} : {})}
      }, (error, stdout) => {
        if (error) return reject(fail(error.code === 'ENOENT' ? 503 : error.killed ? 504 : 422,
          error.code === 'ENOENT' ? 'PDF conversion needs local setup. See the PDF converter section in README.md.' : error.killed ? 'Conversion took too long. Try a smaller PDF.' : 'Conversion could not finish. Try an unlocked PDF with selectable text.'));
        try {
          const result = JSON.parse(stdout);
          if (result.error) return reject(fail(result.code === 'setup' ? 503 : result.code === 'large' ? 413 : 422, result.error));
          resolve(result);
        } catch { reject(fail(500, 'The PDF converter returned an unreadable response.')); }
      });
      child.stdin.on('error', () => {}); // Worker may exit early on invalid input or cancellation.
      child.stdin.end(data);
    });
  }
  return {
    async status() {
      try { return {...await run(undefined, true), maxBytes: MAX_PDF, directory: CONVERTED_DIRECTORY}; }
      catch (error) { return {ready: false, error: error.message, maxBytes: MAX_PDF, directory: CONVERTED_DIRECTORY}; }
    },
    async convert(data, signal) {
      if (!Buffer.isBuffer(data) || !data.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw fail(400, 'Choose a valid PDF file.');
      if (data.length > MAX_PDF) throw fail(413, 'PDFs are limited to 25 MiB.');
      if (busy) throw fail(409, 'Another PDF is being converted. Please wait for it to finish.');
      busy = true;
      try { return await run(data, false, signal); } finally { busy = false; }
    }
  };
}

export async function saveConvertedMarkdown(root, input) {
  if (!input || typeof input.filename !== 'string' || input.filename.length > 160 || !/^[a-z0-9][a-z0-9 ._-]*\.md$/i.test(input.filename) || /^(readme|agents)\.md$/i.test(input.filename)) throw fail(400, 'Use a .md filename with letters, numbers, spaces, dots, hyphens or underscores.');
  if (typeof input.content !== 'string' || !input.content.trim()) throw fail(400, 'There is no Markdown to save.');
  if (Buffer.byteLength(input.content) > MAX_MARKDOWN) throw fail(413, 'Markdown is limited to 2 MiB.');
  const directory = path.join(root, CONVERTED_DIRECTORY);
  await fs.mkdir(directory, {recursive: true, mode: 0o700});
  if ((await fs.lstat(directory)).isSymbolicLink() || await fs.realpath(directory) !== directory) throw fail(403, 'Converted must be a real directory inside this workspace.');
  const file = path.join(directory, input.filename);
  try { await fs.writeFile(file, input.content, {flag: 'wx', mode: 0o600}); }
  catch (error) { if (error.code === 'EEXIST') throw fail(409, 'That filename already exists. Choose another name; existing files are never overwritten.'); throw error; }
  return {path: `${CONVERTED_DIRECTORY}/${input.filename}`, bytes: Buffer.byteLength(input.content)};
}
