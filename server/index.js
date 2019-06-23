require('dotenv').config();

const express = require('express');
const { ParseServer } = require('parse-server');
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const request = require('request');
const { createServer } = require('http');
const updates = require('./updatescript');

const Console = console;
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  Console.log('DATABASE_URI not specified, falling back to localhost.');
}

const port = process.env.SERVER_PORT || 1337;
const serverURL = process.env.SERVER_URL || 'http://localhost';
const parseUri = `${serverURL}:${port}/api`;

const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/ims',
  cloud: path.join(__dirname, '/cloud/main.js'),
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  serverURL: parseUri || 'http://localhost:1337/api',
  maxUploadSize: `${process.env.MAX_UPLOAD_SIZE}mb` || '20mb',
});

const app = express();
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use('/api', api);

if (process.env.NODE_ENV !== 'production') {
  const dashboard = new ParseDashboard({
    apps: [
      {
        serverURL: parseUri || 'http://localhost:1337/api',
        appId: process.env.APP_ID,
        masterKey: process.env.MASTER_KEY,
        appName: process.env.APP_NAME,
      },
    ],
  });
  app.use('/dashboard', dashboard);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', (req, res) => {
  res.status(200).send('Hello World ~');
});

app.use('/download', (req, res) => {
  const { url, filename } = req.query;
  res.setHeader('content-disposition', `attachment; filename=${encodeURIComponent(`${filename}`)}`);
  req.pipe(request(url)).pipe(res);
});

const httpServer = createServer(app);
httpServer.listen(port, () => {
  Console.log(`backend running on port ${port}.`);
  // eslint-disable-next-line consistent-return
  updates.apply(err => {
    if (err) return console.error(err); // eslint-disable-line
  });
});
ParseServer.createLiveQueryServer(httpServer);
