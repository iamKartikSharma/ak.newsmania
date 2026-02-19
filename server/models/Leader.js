const mongoose = require('mongoose');

const leaderSchema = mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    org: { type: String, required: true },
    image: { type: String }, // Optional URL for image
}, { timestamps: true });

module.exports = mongoose.model('Leader', leaderSchema);
