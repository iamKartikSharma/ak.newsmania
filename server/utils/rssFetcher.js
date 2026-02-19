const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

const FEEDS = [
    {
        name: 'The Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        logo: 'https://static.toiimg.com/photo/msid-47529300/47529300.jpg'
    },
    {
        name: 'Business Standard',
        url: 'https://www.business-standard.com/rss/home_page_top_stories.rss',
    },
    {
        name: 'Livemint',
        url: 'https://www.livemint.com/rss/news',
    },
    {
        name: 'The Economic Times',
        url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    },
    {
        name: 'Financial Times',
        url: 'https://www.ft.com/?format=rss',
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
