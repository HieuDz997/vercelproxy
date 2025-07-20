const express = require('express');
const axios = require('axios');
const app = express.Router();

let cachedProxies = [];
let lastUpdated = 0;
const CACHE_DURATION = 2 * 60 * 1000;

async function fetchProxies() {
  try {
    const urls = [
      'http://36.50.134.20:3000/download/vn.txt',
      'http://36.50.134.20:3000/download/proxyspace_vn.txt'
    ];
    const responses = await Promise.all(urls.map(url =>
      axios.get(url, { timeout: 10000 }).catch(() => ({ data: '' }))
    ));
    const proxies = responses.flatMap(res => res.data.split('\n').filter(line => line.trim()));
    cachedProxies = [...new Set(proxies)];
    lastUpdated = Date.now();
  } catch (error) {
    console.error('Error fetching proxies:', error.message);
    cachedProxies = [];
  }
}

fetchProxies();
setInterval(fetchProxies, CACHE_DURATION + Math.random() * 60 * 1000);

app.get('/api/proxies/vn', async (req, res) => {
  if (Date.now() - lastUpdated > CACHE_DURATION) {
    await fetchProxies();
  }
  res.set('Content-Type', 'text/plain');
  res.send(cachedProxies.join('\n'));
});

module.exports = app;
