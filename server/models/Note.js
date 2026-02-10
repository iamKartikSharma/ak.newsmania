const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    content: { type: String, required: true },
    newsId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
