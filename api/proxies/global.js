const express = require('express');
const axios = require('axios');
const app = express.Router();

let cachedProxies = [];
let lastUpdated = 0;
const CACHE_DURATION = 2 * 60 * 1000;

async function fetchProxies() {
  try {
    const url = 'http://36.50.134.20:3000/download/http.txt';
    const response = await axios.get(url, { timeout: 10000 });
    cachedProxies = response.data.split('\n').filter(line => line.trim());
    lastUpdated = Date.now();
  } catch (error) {
    console.error('Error fetching proxies:', error.message);
    cachedProxies = [];
  }
}

fetchProxies();
setInterval(fetchProxies, CACHE_DURATION + Math.random() * 60 * 1000);

app.get('/api/proxies/global', async (req, res) => {
  if (Date.now() - lastUpdated > CACHE_DURATION) {
    await fetchProxies();
  }
  res.set('Content-Type', 'text/plain');
  res.send(cachedProxies.join('\n'));
});

module.exports = app;
