const Class = require('../models/Class');
const User = require('../models/User')


const createClass = async (req, res) => {
    const { title, content, subject, danger, dangerLevel, youtubeUrls } = req.body;  
    const files = req.files || []; 
    const userId = req.userId;

    const normalizeTitle = (value) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');

    if (!userId) {
        return res.status(400).json({ message: 'Usuário inválido ou não logado' });
    }

    const user = await User.findById(userId).select('username');

    if (!user) {
        return res.status(400).json({ message: 'Usuário inválido ou não logado' });
    }

    const authorUsername = user.username;

    if (!title || !subject || !danger || !dangerLevel || !content) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
    }

    try {
        const normalizedTitle = normalizeTitle(title)

        const titleExists = await Class.findOne({ normalizedTitle });
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

        if (medias.length > 2) {
            return res.status(400).json({ message: 'Você só pode enviar no máximo 2 mídias (imagens ou vídeos).' });
        }

        const newClass = new Class({
            title,
            normalizedTitle,
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
            normalizedTitle: newClass.normalizedTitle,
            medias: newClass.medias
        });
        
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        return res.status(500).json({ message: 'Erro interno ao criar aula' });
    }
};

const getClassByTitle = async (req, res) => {
    const { classTitle } = req.body

    try {
        if (!classTitle || String(classTitle).trim() === '') {
            return res.status(400).json({ mensagem: "Insira o título da aula que procura" });
        }

        const searchedClass = await Class.findOne({ normalizedTitle: classTitle }) // || await Class.findOne({ title: classTitle });

        if (!searchedClass) {
            return res.status(404).json({ mensagem: "Aula não encontrada pelo título" });
        }

        return res.status(200).json({
            authorUsername: searchedClass.authorUsername,
            author: searchedClass.author,
            title: searchedClass.title,
            content: searchedClass.content,
            subject: searchedClass.subject,
            danger: searchedClass.danger,
            dangerLevel: searchedClass.dangerLevel,
            cover: searchedClass.cover,
            medias: searchedClass.medias,
            coments: searchedClass.coments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }

};

module.exports = {
    createClass,
    getClassByTitle
};
