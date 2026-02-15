const express = require('express');
const router = express.Router();
const axios = require('axios');

// @desc    Get SEBI related news for timeline
// @route   GET /api/sebi/news
router.get('/news', async (req, res) => {
    try {
        // Query for SEBI or related terms
        // Sort by publishedAt to get a chronological timeline
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: '"SEBI" OR "Securities and Exchange Board of India"',
                searchIn: 'title',
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20
            }
        });

        // Double check: Ensure title actually contains SEBI (case insensitive)
        const articles = response.data.articles.filter(article => {
            const title = article.title.toLowerCase();
            return (title.includes('sebi') || title.includes('securities and exchange board')) && article.title !== '[Removed]';
        });
        res.json(articles);
    } catch (err) {
        console.error('Error fetching SEBI news:', err.message);
        res.status(500).json({ message: 'Failed to fetch SEBI news' });
    }
});

// @desc    Explain news text in simple language (Mock AI)
// @route   POST /api/sebi/explain
router.post('/explain', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        // START: Mock AI Logic (Heuristic Summarization)
        // In a real app, this would call OpenAI or Gemini API

        // 1. Split into sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        // 2. Take the first few sentences as the "summary" or look for keywords
        // This is a very basic "extractor"
        const summarySentences = sentences.slice(0, 2);

        let simplifiedText = summarySentences.join('. ') + '.';

        // Add some "AI" flavor
        simplifiedText = `Here is the simple explanation: ${simplifiedText} This update is significant for market participants as it likely impacts regulatory compliance and trading norms.`;

        // END: Mock AI Logic

        res.json({ explanation: simplifiedText });
    } catch (err) {
        console.error('Error in explain endpoint:', err.message);
        res.status(500).json({ message: 'Failed to generate explanation' });
    }
});

module.exports = router;
