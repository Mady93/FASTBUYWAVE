import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { environment } from 'src/app/environments/environment';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({
    bootstrap,
    providers: [{ provide: APP_BASE_HREF, useValue: '' }],
  });

  // Middleware
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Static files
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: environment.production ? '1y' : '0',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }),
  );

  server.get('*', (req, res, next) => {
    const url = req.originalUrl;

    commonEngine
      .render({
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
      })
      .then((html) => {
        res.send(html);
      })
      .catch((err) => {
        next(err);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();

  server.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}

run();
