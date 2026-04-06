const mongoose = require("mongoose")

const pageSchema = new mongoose.Schema ({
    //Sem maxlenght
    bigContent: {type: String},

    smallContent: {type: String},

    imageUrl: {type: String},

    videoId: {type: String},

    pageNumber: {type: Number, required: true}
})

const classSchema = new mongoose.Schema({
    //Sem a média das notas
    //Data de publicação nos timestamps
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

    title: {type: String, required: true},

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
    },

    pages: [pageSchema]

}, {
    timestamps: true
})

module.exports = mongoose.model("Class", classSchema)