const { fetchIndianNews } = require('./utils/rssFetcher');

async function testbackend() {
    console.log('Testing fetchIndianNews()...');
    try {
        const news = await fetchIndianNews();
        console.log(`Successfully fetched ${news.length} news items.`);
        if (news.length > 0) {
            console.log('Sample item:', news[0]);
        } else {
            console.warn('No items found! Check network or feed URLs.');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testbackend();
