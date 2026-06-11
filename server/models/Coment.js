const mongoose = require('mongoose');

const comentSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    authorUsername: { type: String, required: true },

    comentedClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    classTitle: { type: String, required: true },

    content: { type: String, required: true },

    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }]

}, {timestamps: true});

const Coment = mongoose.model('Coment', comentSchema);

const responseSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    authorUsername: { type: String, required: true },

    coment: { type: mongoose.Schema.Types.ObjectId, ref: 'Coment', required: true },

    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    content: { type: String, required: true }

}, {timestamps: true});

const Response = mongoose.model('Response', responseSchema);

module.exports = { Coment, Response };