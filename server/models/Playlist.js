const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    name: { type: String, required: true },

    normalizedName: { type: String, required: true },

    cover: { type: String, required: true },

    description: { type: String, required: true },

    private: { type: Boolean, required: true, default: true },

    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

    ratingCount: {type: Number, default: 0},
    ratingSum: {type: Number, default: 0},
    ratingAverage: {type: Number, default: 0, min: 0, max: 5},
})

playlistSchema.index(
    { name: 'text', description: 'text' },
    { default_language: 'portuguese', weights: { name: 3, description: 1 } }
)

module.exports = mongoose.model('Playlist', playlistSchema);