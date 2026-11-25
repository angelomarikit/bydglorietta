import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const root = path.resolve(import.meta.dirname, "..");
const text = await collectText(path.join(root, "src"));
const alphabet = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "?",
  "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõöøùúûüışÿ",
  "??????????????????????????????????????????????????????????????????????????????????Œœ????????????Šš??????????????????????Ÿ????",
  " .,;:!?¡¿'\"“”‘’`´^~¨¯·•…–—????",
  "()[]{}<>/\\|&@#$%*+=_°±×÷?",
].join("");
const characters = [...new Set(`${alphabet}${text}`)].join("");

const faces = [
  ["FZLanTingHeiS-R-GB.ttf", "FZLanTingHeiS-R-GB.woff2"],
  ["FZLanTingHeiS-DB.ttf", "FZLanTingHeiS-DB.woff2"],
  ["FZLanTingHeiS-B-GB.ttf", "FZLanTingHeiS-B-GB.woff2"],
  ["SourceHanSansSC-Light.otf", "SourceHanSansSC-Light.woff2"],
  ["SourceHanSansSC-Medium.otf", "SourceHanSansSC-Medium.woff2"],
  ["SourceHanSansSC-Bold.otf", "SourceHanSansSC-Bold.woff2"],
];

for (const [input, output] of faces) {
  const source = await readFile(path.join(root, "public", "fonts", input));
  const subset = await subsetFont(source, characters, { targetFormat: "woff2" });
  await writeFile(path.join(root, "public", "fonts", output), subset);
  console.log(`${output} ${subset.length} bytes from ${source.length}`);
}

async function collectText(dir) {
  let value = "";
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) value += await collectText(full);
    else if (/\.(tsx|ts|css|html)$/.test(entry.name)) value += await readFile(full, "utf8");
  }
  return value;
}
