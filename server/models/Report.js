const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({ 
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    class : { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },

    reason : { type: String, required: true,
        enum: [
            "Conteúdo incorreto ou perigoso", 
            "Linguagem inapropriada",
            "Conteúdo fora do tema do site",
            "Plágio ou cópia indevida",
            "Spam ou propaganda",
            "Imagens ou vídeos inapropriados",
            "Informações desatualizadas",
            "Título ou nome de usuário inapropriado"
        ]},

    text: { type: String }

}, {timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
