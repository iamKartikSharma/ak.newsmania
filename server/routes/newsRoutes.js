const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Note = require('../models/Note');
const multer = require('multer');
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

        const { title, content, category, type, link } = req.body;

        // Update text fields
        if (title) news.title = title;
        if (content) news.content = content;
        if (category) news.category = category;
        if (type) news.type = type;
        if (link) news.link = link;

        // Handle Main File(s) - Append or Replace
        if (req.files && req.files['file']) {
            const newFiles = req.files['file'].map(file => ({
                url: file.path,
                publicId: file.filename
            }));

            if (type === 'image' || news.type === 'image') {
                // If it's an image type, we append to existing images
                news.images.push(...newFiles);
                // If for some reason mediaUrl was empty, set it
                if (!news.mediaUrl) {
                    news.mediaUrl = newFiles[0].url;
                    news.publicId = newFiles[0].publicId;
                }
            } else {
                // For video/audio, we typically replace the main media
                // Optional: Delete old media from Cloudinary if needed, but let's keep it safe for now or logic gets complex
                news.mediaUrl = newFiles[0].url;
                news.publicId = newFiles[0].publicId;
                news.images = []; // Clear images if switching to non-image type? Or keep them? Let's clear to avoid confusion.
            }
        }

        // Handle Voice Note - Replace
        if (req.files && req.files['voice']) {
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
