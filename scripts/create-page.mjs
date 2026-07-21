#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const pagesDir = path.join(rootDir, "pages");
const registryPath = path.join(rootDir, "data", "pages.json");
const defaultTemplateId = "page_pd_dasnum_1";

function usage() {
  console.log(`
Cara pakai:
  node scripts/create-page.mjs
  node scripts/create-page.mjs page_pd_dasnum_2 "Judul Page" "Ringkasan singkat"

Argumen:
  1. folder/id page, contoh: page_pd_dasnum_2
  2. judul page
  3. ringkasan untuk daftar isi dan bookmark

Opsional:
  --from=page_pd_dasnum_1
  --eyebrow="Dasar-Dasar Numerasi"
  --draft
`);
}

function parseArgs(argv) {
  const options = {
    templateId: defaultTemplateId,
    published: true,
    eyebrow: "",
  };
  const positional = [];

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--draft") {
      options.published = false;
    } else if (arg.startsWith("--from=")) {
      options.templateId = arg.slice("--from=".length);
    } else if (arg.startsWith("--eyebrow=")) {
      options.eyebrow = arg.slice("--eyebrow=".length);
    } else {
      positional.push(arg);
    }
  }

  return {
    ...options,
    id: positional[0] ?? "",
    title: positional[1] ?? "",
    summary: positional[2] ?? "",
  };
}

function validatePageId(id) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(id)) {
    throw new Error("ID page hanya boleh huruf kecil, angka, underscore, dan dash. Contoh: page_pd_dasnum_2");
  }
}

function copyTemplate(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => path.basename(source) !== ".DS_Store",
  });

  const assetsDir = path.join(targetDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
}

function replaceFirst(source, pattern, replacement) {
  if (!pattern.test(source)) {
    return source;
  }

  return source.replace(pattern, replacement);
}

function updateIndex(targetDir, page) {
  const indexPath = path.join(targetDir, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  html = replaceFirst(html, /<title>.*?<\/title>/s, `<title>${page.title} | Brain Academy</title>`);
  html = replaceFirst(html, /(<p class="hero__eyebrow">)(.*?)(<\/p>)/s, `$1${page.eyebrow}$3`);
  html = replaceFirst(html, /(<h1>)(.*?)(<\/h1>)/s, `$1${page.title}$3`);

  fs.writeFileSync(indexPath, html);
}

function updateRegistry(page) {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

  if (registry.some((item) => item.id === page.id)) {
    throw new Error(`ID "${page.id}" sudah ada di data/pages.json`);
  }

  registry.push({
    id: page.id,
    title: page.title,
    summary: page.summary,
    url: `pages/${page.id}/index.html`,
    published: page.published,
  });

  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

async function askMissing(options) {
  if (options.help) {
    usage();
    process.exit(0);
  }

  if (options.id && options.title && options.summary) {
    return options;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const id = options.id || await rl.question("ID folder page baru, contoh page_pd_dasnum_2: ");
    const title = options.title || await rl.question("Judul page: ");
    const summary = options.summary || await rl.question("Ringkasan singkat: ");
    const eyebrow = options.eyebrow || await rl.question("Eyebrow/label hero [Dasar-Dasar Numerasi]: ");

    return {
      ...options,
      id: id.trim(),
      title: title.trim(),
      summary: summary.trim(),
      eyebrow: eyebrow.trim() || "Dasar-Dasar Numerasi",
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const options = await askMissing(parseArgs(process.argv.slice(2)));
  const page = {
    id: options.id,
    title: options.title,
    summary: options.summary,
    eyebrow: options.eyebrow || "Dasar-Dasar Numerasi",
    published: options.published,
  };

  validatePageId(page.id);

  const sourceDir = path.join(pagesDir, options.templateId);
  const targetDir = path.join(pagesDir, page.id);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Template tidak ditemukan: pages/${options.templateId}`);
  }

  if (fs.existsSync(targetDir)) {
    throw new Error(`Folder target sudah ada: pages/${page.id}`);
  }

  copyTemplate(sourceDir, targetDir);
  updateIndex(targetDir, page);
  updateRegistry(page);

  console.log(`Page berhasil dibuat: pages/${page.id}/`);
  console.log(`Edit materi di: pages/${page.id}/data.json`);
  console.log(`Preview: http://127.0.0.1:4173/pages/${page.id}/index.html`);
}

main().catch((error) => {
  console.error(`Gagal membuat page: ${error.message}`);
  process.exit(1);
});
