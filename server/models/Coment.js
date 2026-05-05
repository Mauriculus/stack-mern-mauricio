const mongoose = require('mongoose');

const comentSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    content: { type: String, required: true }

}, {timestamps: true});

module.exports = mongoose.model('Coment', ComentSchema);

const responseSchema = new mongoose.Schema({ 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    coment: { type: mongoose.Schema.Types.ObjectId, ref: 'Coment', required: true },

    content: { type: String, required: true }

}, {timestamps: true});