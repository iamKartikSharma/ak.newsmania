const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const News = require('../models/News');

// @desc    Get all events
// @route   GET /api/events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ startDate: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create event
// @route   POST /api/events
router.post('/', async (req, res) => {
    try {
        const { title, description, startDate, endDate } = req.body;
        const event = new Event({ title, description, startDate, endDate });
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get event details with news
// @route   GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const news = await News.find({ eventId: req.params.id }).sort({ date: 1 });

        res.json({ event, news });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
