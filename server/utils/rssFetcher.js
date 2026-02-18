const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

const FEEDS = [
    {
        name: 'Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        logo: 'https://static.toiimg.com/photo/msid-47529300/47529300.jpg' // Generic fallback or frontend handles logos
    },
    {
        name: 'Dainik Jagran',
        url: 'https://rss.jagran.com/rss/news/national.xml',
    },
    {
        name: 'Amar Ujala',
        url: 'https://www.amarujala.com/rss/breaking-news.xml',
    },
    {
        name: 'The Indian Express',
        url: 'https://indianexpress.com/feed/',
    },
    {
        name: 'Hindustan Times',
        url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    }
];

const fetchIndianNews = async () => {
    let allNews = [];

    const fetchPromises = FEEDS.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);

            // Normalize data
            const items = feed.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item.contentSnippet || item.content || '',
                source: source.name,
                isoDate: item.isoDate ? new Date(item.isoDate) : new Date(item.pubDate)
            }));

            return items;
        } catch (error) {
            console.error(`Error fetching feed from ${source.name}:`, error.message);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);

    // Flatten array
    results.forEach(items => {
        allNews = [...allNews, ...items];
    });

    // Sort by date (newest first)
    allNews.sort((a, b) => b.isoDate - a.isoDate);

    return allNews;
};

module.exports = { fetchIndianNews };
