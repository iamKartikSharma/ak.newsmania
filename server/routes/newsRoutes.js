const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Note = require('../models/Note');
const multer = require('multer');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Config (Ensure env vars are set)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log(`[DEBUG] Cloudinary processing file: ${file.originalname}, Mimetype: ${file.mimetype}`);
        let resource_type = 'image';
        if (file.mimetype && (file.mimetype.startsWith('audio') || file.mimetype.startsWith('video'))) {
            resource_type = 'video';
        }
        console.log(`[DEBUG] Determined resource_type: ${resource_type}`);

        return {
            folder: 'newsmania',
            resource_type: resource_type,
            // Add random suffix to prevent overwrite if multiple files upload at same ms
            public_id: file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1000),
        };
    },
});

const upload = multer({ storage: storage });

// @desc    Get all news
// @route   GET /api/news
router.get('/', async (req, res) => {
    try {
        const { category, search, eventId } = req.query;
        let query = {};

        if (category) query.category = category;
        if (eventId) query.eventId = eventId;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const news = await News.find(query).sort({ date: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get trending news
// @route   GET /api/news/trending
router.get('/trending', async (req, res) => {
    try {
        // Fetch top headlines from India (or change country as needed)
        // Using 'technology' category or just general top headlines
        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                country: 'us', // Default to US for broader "trending" feel, or 'in' for India
                category: 'general',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 10
            }
        });

        // Filter out removed articles
        const articles = response.data.articles.filter(article => article.title !== '[Removed]');
        res.json(articles);
    } catch (err) {
        console.error('Error fetching trending news:', err.message);
        // Fallback or empty array so frontend doesn't crash
        res.json([]);
    }
});

// @desc    Upload news
// @route   POST /api/news
router.post('/', upload.fields([{ name: 'file', maxCount: 10 }, { name: 'voice', maxCount: 1 }]), async (req, res) => {
    console.log('[DEBUG] POST /api/news request received');
    console.log('[DEBUG] Body:', req.body);
    console.log('[DEBUG] Files:', req.files);
    try {
        const { title, content, category, type, date, eventId, link } = req.body;
        let mediaUrl = '';
        let publicId = '';
        let voiceUrl = '';
        let voicePublicId = '';
        let images = [];

        // Handle Main File(s)
        if (req.files && req.files['file']) {
            // First file is main media (backward compatibility)
            mediaUrl = req.files['file'][0].path;
            publicId = req.files['file'][0].filename;

            // All files go to images array
            images = req.files['file'].map(file => ({
                url: file.path,
                publicId: file.filename
            }));
        }

        // Handle Voice Note
        if (req.files && req.files['voice']) {
            voiceUrl = req.files['voice'][0].path;
            voicePublicId = req.files['voice'][0].filename;
        }

        const newNews = new News({
            title,
            content,
            category,
            type,
            mediaUrl,
            publicId,
            images,
            voiceUrl,
            voicePublicId,
            link,
            date: date || Date.now(),
            eventId: eventId || null
        });

        const savedNews = await newNews.save();
        console.log('[DEBUG] News saved successfully, ID:', savedNews._id);
        res.status(201).json(savedNews);
    } catch (err) {
        console.error('[DEBUG] Error in POST /api/news:', err);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update news
// @route   PUT /api/news/:id
router.put('/:id', upload.fields([{ name: 'file', maxCount: 10 }, { name: 'voice', maxCount: 1 }]), async (req, res) => {
    console.log(`[DEBUG] PUT /api/news/${req.params.id} request received`);
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        const { title, content, category, type, link, deleteImages } = req.body;

        // Update text fields
        if (title) news.title = title;
        if (content) news.content = content;
        if (category) news.category = category;
        if (type) news.type = type;
        if (link) news.link = link;

        // Handle Image Deletion
        if (deleteImages) {
            const publicIdsToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
            console.log(`[DEBUG] Deleting images: ${publicIdsToDelete.join(', ')}`);

            for (const publicId of publicIdsToDelete) {
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (err) {
                        console.error(`[DEBUG] Failed to delete image ${publicId} from Cloudinary:`, err);
                    }
                }
            }

            // Remove from news.images
            if (news.images && news.images.length > 0) {
                news.images = news.images.filter(img => !publicIdsToDelete.includes(img.publicId));
            }
        }

        // Handle Main File(s) - Append or Replace
        if (req.files && req.files['file']) {
            console.log(`[DEBUG] Received ${req.files['file'].length} new files for update.`);
            const newFiles = req.files['file'].map(file => ({
                url: file.path,
                publicId: file.filename
            }));

            // Determine current type (from body or existing record)
            const currentType = type || news.type;

            if (currentType === 'image') {
                // Initialize images array if it doesn't exist
                if (!news.images) {
                    news.images = [];
                }

                // MIGRATION FIX: If images array is empty but we have a main mediaUrl, push it to array first
                // Only do this if we are NOT deleting that specific image (checked via publicId if possible, but safely we can just add if it's not in delete list)
                // However, if we just deleted everything, we shouldn't migrate. 
                // Migration should happen if we are ADDING files to a legacy post.
                // If the user deleted the "legacy" image via deleteImages (which requires us to know its publicId), it would be handled.
                // But legacy images might not have a publicId stored in the array logic. 
                // Let's rely on: if news.images is empty, and we have mediaUrl, AND we are adding files, we should preserve mediaUrl.
                if (news.images.length === 0 && news.mediaUrl && (!deleteImages || !deleteImages.includes(news.publicId))) {
                    news.images.push({
                        url: news.mediaUrl,
                        publicId: news.publicId || ''
                    });
                    console.log(`[DEBUG] Migrated legacy mediaUrl to images array.`);
                }

                // Append new files
                news.images.push(...newFiles);
                console.log(`[DEBUG] Appended ${newFiles.length} images. Total images: ${news.images.length}`);
            } else {
                console.log(`[DEBUG] Replacing media for type: ${currentType}`);
                // Replace main media for non-image types (video/audio)
                if (newFiles.length > 0) {
                    news.mediaUrl = newFiles[0].url;
                    news.publicId = newFiles[0].publicId;
                    news.images = []; // Clear images array
                }
            }
        }

        // Update Main MediaUrl for Images (Sync with first image in array)
        if ((type === 'image' || news.type === 'image') && news.images && news.images.length > 0) {
            news.mediaUrl = news.images[0].url;
            news.publicId = news.images[0].publicId;
        } else if ((type === 'image' || news.type === 'image') && (!news.images || news.images.length === 0)) {
            // If all images deleted
            news.mediaUrl = '';
            news.publicId = '';
        }

        // Handle Voice Note - Replace
        if (req.files && req.files['voice']) {
            console.log(`[DEBUG] Received voice note update.`);
            news.voiceUrl = req.files['voice'][0].path;
            news.voicePublicId = req.files['voice'][0].filename;
        }

        const updatedNews = await news.save();
        res.json(updatedNews);
    } catch (err) {
        console.error('[DEBUG] Error in PUT /api/news:', err);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Delete news
// @route   DELETE /api/news/:id
router.delete('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });

        if (news.publicId) {
            await cloudinary.uploader.destroy(news.publicId);
        }

        if (news.voicePublicId) {
            await cloudinary.uploader.destroy(news.voicePublicId, { resource_type: 'video' }); // Audio is often stored as video in Cloudinary or 'raw'
        }

        await News.deleteOne({ _id: req.params.id });
        res.json({ message: 'News deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Add note to news
// @route   POST /api/news/:id/notes
router.post('/:id/notes', async (req, res) => {
    try {
        const { content } = req.body;
        const note = new Note({
            content,
            newsId: req.params.id
        });
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get notes for news
// @route   GET /api/news/:id/notes
router.get('/:id/notes', async (req, res) => {
    try {
        const notes = await Note.find({ newsId: req.params.id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
