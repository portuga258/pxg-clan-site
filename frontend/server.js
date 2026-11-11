import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT) || 4173;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function isWithinDist(filePath) {
  const pathFromDist = relative(distDirectory, filePath);
  return pathFromDist === '' || (!pathFromDist.startsWith(`..${sep}`) && pathFromDist !== '..' && !isAbsolute(pathFromDist));
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    response.writeHead(404).end('Not Found');
    return;
  }

  let filePath = resolve(distDirectory, `.${pathname}`);
  if (!isWithinDist(filePath)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if (!statSync(filePath).isFile()) filePath = resolve(distDirectory, 'index.html');
  } catch {
    filePath = resolve(distDirectory, 'index.html');
  }

  response.setHeader(
    'Content-Type',
    contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream'
  );
  response.setHeader(
    'Cache-Control',
    filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
  );
  if (request.method === 'HEAD') {
    response.writeHead(200).end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on('error', (error) => {
    console.error('Falha ao servir arquivo do frontend:', error);
    if (!response.headersSent) response.writeHead(500);
    response.end('Internal Server Error');
  });
  stream.pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend PXG disponível na porta ${port}`);
});

server.on('error', (error) => {
  console.error('Não foi possível iniciar o servidor do frontend:', error);
  process.exitCode = 1;
});
