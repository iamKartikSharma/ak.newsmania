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
    params: {
        folder: 'newsmania',
        resource_type: 'auto', // Allow image, video, audio
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
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, content, category, type, date, eventId } = req.body;
        let mediaUrl = '';
        let publicId = '';

        if (req.file) {
            mediaUrl = req.file.path;
            publicId = req.file.filename;
        }

        const newNews = new News({
            title,
            content,
            category,
            type,
            mediaUrl,
            publicId,
            date: date || Date.now(),
            eventId: eventId || null
        });

        const savedNews = await newNews.save();
        res.status(201).json(savedNews);
    } catch (err) {
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
