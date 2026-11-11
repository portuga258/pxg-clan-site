import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const apiUrl = 'https://wiki.pokexgames.com/api.php';
const wikiPages = [
  'Itens de Loot',
  'Nightmare Itens',
  'Held Itens',
  'Itens Especiais',
  'Itens:Outros',
  'Dimensional Zone Itens',
];
const generalIndex = 'Itens Gerais';
const itemIndexPages = new Set([
  ...wikiPages,
  generalIndex,
  'Ball Capsule',
  'Berries',
  'Big Figures',
  'Comidas',
  'Câmeras',
  'Drop de Itens',
  'Elixir',
  'Holders',
  'Mochilas',
  'Moedas',
  'NPC Max (Decoração)',
  'NPC Mite (Eletrônicos)',
  'Pedras de Evolução',
  'Pokébolas',
  'Pokémon Egg',
  'Poções',
  'Tokens',
  'Workshop',
]);

async function queryWiki(params) {
  const url = new URL(apiUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wiki API respondeu ${response.status}`);
  }
  return response.json();
}

async function getLinkedPages(title) {
  const pages = [];
  let continuation;
  do {
    const result = await queryWiki({
      action: 'query',
      prop: 'links',
      titles: title,
      pllimit: 'max',
      format: 'json',
      ...(continuation || {}),
    });
    const page = Object.values(result.query.pages)[0];
    if (page.missing !== undefined) {
      throw new Error(`Página da Wiki não encontrada: ${title}`);
    }
    pages.push(...(page.links || []).filter((link) => link.ns === 0 && link.missing === undefined));
    continuation = result.continue;
  } while (continuation);
  return pages;
}

function normalizeTitle(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^Arquivo:/i, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

const genericImages = new Set([
  'aoe',
  'buff',
  'damage',
  'focusblocked',
  'healingstatus',
  'nevermiss',
  'self',
  'target',
  'telekineticcompass',
]);

function scoreImageMatch(itemName, imageTitle) {
  const imageName = normalizeTitle(imageTitle);
  if (genericImages.has(imageName)) return 0;

  const itemNameNormalized = normalizeTitle(itemName);
  if (imageName === itemNameNormalized) return 100;
  if (imageName.includes(itemNameNormalized) || itemNameNormalized.includes(imageName)) return 90;

  const itemTokens = itemName.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const imageTokens = imageTitle
    .replace(/^Arquivo:/i, '')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const matchedTokens = itemTokens.filter((token) =>
    imageTokens.some((imageToken) =>
      imageToken === token ||
      (token.length >= 4 && imageToken.startsWith(token.slice(0, 4))) ||
      (imageToken.length >= 4 && token.startsWith(imageToken.slice(0, 4)))
    )
  );
  return matchedTokens.length ? 20 + (matchedTokens.length / itemTokens.length) * 70 : 0;
}

async function getMatchingImageTitles(items, sourcePages) {
  const imageTitles = new Set();
  const itemsByTitle = new Map(items.map((item) => [normalizeTitle(item.name), item]));
  const pageTitles = [...new Set([...items.map((item) => item.name), ...sourcePages])];

  for (let index = 0; index < pageTitles.length; index += 40) {
    const batch = pageTitles.slice(index, index + 40);
    let continuation;
    do {
      const result = await queryWiki({
        action: 'query',
        prop: 'images',
        titles: batch.join('|'),
        imlimit: 'max',
        format: 'json',
        ...(continuation || {}),
      });

      for (const page of Object.values(result.query.pages)) {
        const pageItem = itemsByTitle.get(normalizeTitle(page.title));
        for (const image of page.images || []) {
          const exactItem = itemsByTitle.get(normalizeTitle(image.title));
          const targetItem = exactItem || pageItem;
          if (!targetItem) continue;

          const score = scoreImageMatch(targetItem.name, image.title);
          if (score > (targetItem.imageMatchScore || 0)) {
            targetItem.imageTitle = image.title;
            targetItem.imageMatchScore = score;
            imageTitles.add(image.title);
          }
        }
      }
      continuation = result.continue;
    } while (continuation);
  }

  return imageTitles;
}

async function addImageUrls(items) {
  const imageTitles = [...await getMatchingImageTitles(items, sourcePages)];
  const imageUrls = new Map();

  for (let index = 0; index < imageTitles.length; index += 50) {
    const batch = imageTitles.slice(index, index + 50);
    const result = await queryWiki({
      action: 'query',
      prop: 'imageinfo',
      titles: batch.join('|'),
      iiprop: 'url',
      iiurlwidth: '96',
      format: 'json',
    });

    for (const page of Object.values(result.query.pages)) {
      const imageInfo = page.imageinfo?.[0];
      if (imageInfo) {
        imageUrls.set(page.title, (imageInfo.thumburl || imageInfo.url).replace(/^http:/, 'https:'));
      }
    }
  }

  for (const item of items) {
    if (item.imageTitle) {
      item.imageUrl = imageUrls.get(item.imageTitle) || null;
      delete item.imageTitle;
      delete item.imageMatchScore;
    } else {
      item.imageUrl = null;
    }
  }

  for (const item of items.filter((entry) => !entry.imageUrl)) {
    const result = await queryWiki({
      action: 'parse',
      page: item.name,
      prop: 'text',
      format: 'json',
    });
    const html = result.parse?.text?.['*'];
    const source = html?.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1];
    if (source) {
      item.imageUrl = new URL(source.replace(/^http:/, 'https:'), 'https://wiki.pokexgames.com').href;
    }
  }
}

const generalPages = await getLinkedPages(generalIndex);
const sourcePages = [
  ...wikiPages,
  ...generalPages
    .map((page) => page.title)
    .filter((title) => !['NPC Max (Decoração)', 'NPC Mite (Eletrônicos)'].includes(title)),
];
const itemsByName = new Map();

const uniqueSourcePages = new Set(sourcePages);
for (const sourcePage of uniqueSourcePages) {
  const links = await getLinkedPages(sourcePage);
  for (const link of links) {
    const name = link.title.replaceAll('_', ' ').trim();
    if (!name || itemIndexPages.has(name)) continue;

    const item = itemsByName.get(name) || {
      name,
      wikiUrl: `https://wiki.pokexgames.com/${encodeURIComponent(link.title.replaceAll(' ', '_'))}`,
      categories: [],
    };
    if (!item.categories.includes(sourcePage)) item.categories.push(sourcePage);
    itemsByName.set(name, item);
  }
}

const items = [...itemsByName.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
await addImageUrls(items);

const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../frontend/src/data/pxgItemCatalog.json');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  source: 'https://wiki.pokexgames.com/',
  fetchedAt: new Date().toISOString(),
  items,
}, null, 2)}\n`);

const itemsWithImages = items.filter((item) => item.imageUrl).length;
console.log(`Catálogo atualizado: ${items.length} itens de ${uniqueSourcePages.size} páginas de índice; ${itemsWithImages} com imagem correspondente na Wiki.`);
