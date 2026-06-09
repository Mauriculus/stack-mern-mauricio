const Class = require('../models/Class');

const createClass = async (req, res) => {
    const userId = req.userId;
    const { title, content, subject, danger, dangerLevel } = req.body;

    const authorUsername = userId.username

    if (!userId) {
        return res.status(400).json({ message: 'Você deve estar logado para criar uma aula' });
    }
    
    if (!authorUsername) {
        return res.status(400).json({ message: 'Nome de usuário não encontrado' });
    }

    if (!title || !subject || !danger || !dangerLevel || !content) {
        return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    const titleExists = await Class.findOne({ title });
    if (titleExists) {
        return res.status(400).json({ message: 'Já existe uma aula com esse título' });
    }

    try {
        const newClass = new Class({
            title,
            content,
            subject,
            danger,
            dangerLevel,
            author: userId,
            authorUsername: authorUsername
        });

        await newClass.save();
        return res.status(201).json({
            message: 'Aula criada com sucesso',
            classId: newClass._id
        });
        
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        return res.status(500).json({ message: 'Erro ao criar aula' });
    }

};

const addClassMedia = async (req, res) => {
    const userId = req.userId;
    const { classId } = req.params;
    const { youtubeUrl } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Você deve estar logado para adicionar mídia' });
    }

    try {
        const classDoc = await Class.findById(classId);

        if (!classDoc) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        if (classDoc.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Você não tem permissão para editar esta aula' });
        }

        if (classDoc.midias.length >= 2) {
            return res.status(400).json({ message: 'Esta aula já possui o número máximo de mídias' });
        }

        if (req.file) {
            classDoc.midias.push({
                type: 'imagem',
                value: `/uploads/${req.file.filename}`
            });
        } else if (youtubeUrl) {
            classDoc.midias.push({
                type: 'youtube',
                value: youtubeUrl
            });
        } else {
            return res.status(400).json({ message: 'Envie uma imagem (file) ou um link do YouTube (youtubeUrl)' });
        }

        await classDoc.save();

        return res.status(200).json({
            message: 'Mídia adicionada com sucesso',
            midias: classDoc.midias
        });
    } catch (error) {
        console.error('Erro ao adicionar mídia da aula:', error);
        return res.status(500).json({ message: 'Erro ao adicionar mídia da aula' });
    }
};

module.exports = {
    createClass,
    addClassMedia
}