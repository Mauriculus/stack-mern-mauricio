const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    authorUsername: { type: String, required: true },

    commentedClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    classTitle: { type: String, required: true },

    content: { type: String, required: true },

    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }]

}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

const responseSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    authorUsername: { type: String, required: true },

    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },

    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    content: { type: String, required: true }

}, {timestamps: true});

const Response = mongoose.model('Response', responseSchema);

module.exports = { Comment, Response };