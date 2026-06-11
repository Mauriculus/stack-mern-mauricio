const Class = require('../models/Class');


const createClass = async (req, res) => {
    const { title, content, subject, danger, dangerLevel, youtubeUrls } = req.body;  
    const files = req.files || []; 
    const userId = req.userId; 

    const authorUsername = userId.username; 

    if (!userId || !authorUsername) {
        return res.status(400).json({ message: 'Usuário inválido ou não logado' });
    }

    if (!title || !subject || !danger || !dangerLevel || !content) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
    }

    try {
        const titleExists = await Class.findOne({ title });
        if (titleExists) {
            return res.status(400).json({ message: 'Já existe uma aula com esse título' });
        }

        const medias = [];

        for (const file of files) {
            medias.push({
                type: 'imagem',
                value: `/uploads/${file.filename}`
            });
        }

        // Adiciona os links do YouTube (se vieram)
        if (youtubeUrls) {
            // O front-end pode mandar 1 link (string) ou vários (array). Normalizamos para array.
            const urls = Array.isArray(youtubeUrls) ? youtubeUrls : [youtubeUrls];
            for (const url of urls) {
                if (url.trim() !== '') { // Evita links vazios
                    medias.push({
                        type: 'youtube',
                        value: url
                    });
                }
            }
        }

        if (midias.length > 2) {
            return res.status(400).json({ message: 'Você só pode enviar no máximo 2 mídias (imagens ou vídeos).' });
        }

        const newClass = new Class({
            title,
            content,
            subject,
            danger,
            dangerLevel,
            author: userId,
            authorUsername: authorUsername,
            medias: medias // Já salvamos as mídias diretamente na criação
        });

        await newClass.save();

        return res.status(201).json({
            message: 'Aula criada com sucesso',
            classId: newClass._id,
            title: newClass.title,
            medias: newClass.medias
        });
        
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        return res.status(500).json({ message: 'Erro interno ao criar aula' });
    }
};

module.exports = {
    createClass
};
