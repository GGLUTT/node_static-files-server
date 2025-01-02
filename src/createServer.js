'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const urlPath = decodeURIComponent(req.url);


    if (!urlPath.startsWith('/file/')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Use /file/ to load files. Example: /file/index.html');

      return;
    }

    const publicFolder = path.join(__dirname, 'public');
    let relativePath = urlPath.replace('/file/', '');


    if (!relativePath || relativePath === '/') {
      relativePath = 'index.html';
    }

    const normalizedPath = path
      .normalize(relativePath)
      .replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(publicFolder, normalizedPath);

    // Перевірка, чи файл знаходиться всередині public
    if (!filePath.startsWith(publicFolder)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Access to files outside public folder is forbidden.');

      return;
    }

    // Перевірка існування файлу
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404: File not found');

        return;
      }

      // Відправляємо файл
      const fileStream = fs.createReadStream(filePath);

      res.statusCode = 200;
      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('500: Internal server error');
      });
    });
  });

  return server;
}

module.exports = {
  createServer,
};
