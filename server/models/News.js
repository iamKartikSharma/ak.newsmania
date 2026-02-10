const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String }, // For text news
    category: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'video', 'audio'], required: true },
    mediaUrl: { type: String }, // Cloudinary URL
    publicId: { type: String }, // Cloudinary Public ID for deletion
    voiceUrl: { type: String }, // Voice Note URL
    voicePublicId: { type: String }, // Voice Note Public ID
    date: { type: Date, default: Date.now },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
