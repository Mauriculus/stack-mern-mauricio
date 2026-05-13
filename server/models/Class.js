const mongoose = require("mongoose")

const classSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

    title: {type: String, required: true},

    cover: {type: String},

    ratingCount: {type: Number, default: 0},
    ratingSum: {type: Number, default: 0},
    ratingAverage: {type: Number, default: 0, min: 0, max: 5},
    
    content: {type: String},

    image1Url: {type: String},

    image2Url: {type: String},

    video1Id: {type: String},

    video2Id: {type: String},

    subject: {
        type: String,
        enum: ["Elétrica", "Hidráulica", "Eletrodomésticos", "Limpeza", "Culinária", "Outro"],
        required: true
    },

    danger: {type: String, required: true},

    dangerLevel: {
        type: String,
        enum: ["Baixo Risco", "Médio Risco", "Alto Risco"],
        required: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Class", classSchema)