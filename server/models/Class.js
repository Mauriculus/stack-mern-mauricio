const mongoose = require("mongoose")

const mediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["imagem", "youtube"],
        required: true
    },

    value: {
        type: String,
        required: true
    }
}, { _id: false })

const classSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

    authorUsername: {type: String, required: true},

    title: {type: String, required: true},

    cover: {type: String},

    ratingCount: {type: Number, default: 0},
    ratingSum: {type: Number, default: 0},
    ratingAverage: {type: Number, default: 0, min: 0, max: 5},
    
    content: {type: String},

    midias: {
        type: [mediaSchema],
        default: [],
        validate: {
            validator: function (midias) {
                return midias.length <= 2
            },
            message: 'É permitido cadastrar no máximo duas mídias por aula'
        }
    },


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