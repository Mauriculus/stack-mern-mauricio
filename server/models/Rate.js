const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({ 
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    class : { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    value : { type: Number, required: true, min: 0, max: 5 }
}, {timestamps: true });

module.exports = mongoose.model('Rate', rateSchema);