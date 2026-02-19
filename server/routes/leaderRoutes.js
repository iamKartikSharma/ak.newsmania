const express = require('express');
const router = express.Router();
const Leader = require('../models/Leader');

// @desc    Get all leaders
// @route   GET /api/leaders
router.get('/', async (req, res) => {
    try {
        const leaders = await Leader.find().sort({ createdAt: -1 });
        res.json(leaders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Add a new leader
// @route   POST /api/leaders
router.post('/', async (req, res) => {
    try {
        const { name, role, org, image } = req.body;
        const newLeader = new Leader({
            name,
            role,
            org,
            image
        });
        const savedLeader = await newLeader.save();
        res.status(201).json(savedLeader);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Delete a leader
// @route   DELETE /api/leaders/:id
router.delete('/:id', async (req, res) => {
    try {
        await Leader.findByIdAndDelete(req.params.id);
        res.json({ message: 'Leader deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update a leader
// @route   PUT /api/leaders/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, role, org, image } = req.body;
        const updatedLeader = await Leader.findByIdAndUpdate(
            req.params.id,
            { name, role, org, image },
            { new: true }
        );
        res.json(updatedLeader);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
