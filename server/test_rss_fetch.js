const axios = require('axios');
const xml2js = require('xml2js'); // Built-in or need install? xml2js usually needs install. 
// Let's just try to fetch and see the start of the response to verify it's XML.

const feeds = [
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://www.amarujala.com/rss/breaking-news.xml', // speculative
    'https://rss.jagran.com/rss/news/national.xml', // speculative
];

async function testFeeds() {
    for (const url of feeds) {
        try {
            console.log(`Fetching ${url}...`);
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`Status: ${response.status}`);
            console.log(`Content Type: ${response.headers['content-type']}`);
            console.log(`Start of body: ${response.data.substring(0, 100)}`);
            console.log('---');
        } catch (err) {
            console.error(`Error fetching ${url}:`, err.message);
        }
    }
}

testFeeds();
