const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    name: { type: String, required: true },

    normalizedName: { type: String, required: true },

    description: { type: String, required: true },

    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

    ratingCount: {type: Number, default: 0},
    ratingSum: {type: Number, default: 0},
    ratingAverage: {type: Number, default: 0, min: 0, max: 5},
})

module.exports = mongoose.model('Playlist', playlistSchema);