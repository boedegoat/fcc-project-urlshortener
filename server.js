require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const URL = require('url').URL

// Basic Configuration
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = []

const createShortUrl = () => {
  return Math.random().toString(36).substr(2, 4)
}

const dns = require('dns')

app.post('/api/shorturl', (req, res) => {
  const reqUrl = req.body.url
  const url = new URL(reqUrl)

  dns.lookup(url.hostname, (err, address, family) => {
    if (err) {
      res.json({
        error: 'invalid url'
      })
    }
    
    let urlObj = urls.find(url => url.original_url == reqUrl)

    if (!urlObj) {
      urlObj = {
        original_url: reqUrl,
        short_url: createShortUrl()
      }
      urls.push(urlObj)
    }

    res.json(urlObj)
  })
})

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const reqShortUrl = req.params.shortUrl
  const urlObj = urls.find(url => url.short_url == reqShortUrl)

  if (!urlObj) {
    return res.json({
      error: 'No short URL found for the given input'
    })
  }
  
  res.redirect(urlObj.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
