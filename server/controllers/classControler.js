const { urlencoded } = require('express');
const Class = require('../models/Class');
const User = require("../models/User");
const { default: mongoose } = require('mongoose');


const availableSubjects = [
    "Elétrica",
    "Hidráulica",
    "Eletrodomésticos",
    "Limpeza",
    "Culinária",
    "Costura",
    "Outro",
]
const avaliableDanger = [
    'Baixo Risco',
    'Médio Risco',
    'Alto Risco'
]

const createClass = async (req, res) => {
    const { title, content, subject, danger, dangerLevel, youtubeUrls } = req.body;
    const coverFile = req.files?.cover?.[0];
    const galeria = req.files?.medias || [];
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

    if (!title || !subject || !danger || !dangerLevel || !content) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
    }

    if (!coverFile) {
        return res.status(400).json({ message: 'A imagem de capa é obrigatória' });
    }

    try {
        const normalizedTitle = normalizeTitle(title)
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar o usuário"})
        }
        
        if (user.banned === true) {
            return res.status(403).json({mensagem: "Você está banido"})
        }

        if (!availableSubjects.includes(subject)){
            return res.status(400).json({ mensagem: "Escolha um dos temas disponíveis"})
        }
        if (!avaliableDanger.includes(dangerLevel)) {
            return res.status(400).json({ mensagem: "Escolha um dos níveis de risco disponíveis"})
        }

        if (content.length < 20 || content.length > 4000){
            return res.status(400).json({mensagem: "O conteúdo da aula deve estar entre 20 e 4000 caracteres"})
        }

        const medias = [];

        for (const file of galeria) {
            medias.push({
                type: 'imagem',
                value: `/uploads/${file.filename}`
            });
        }

        if (youtubeUrls) {
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
            return res.status(400).json({ message: 'Você só pode enviar no máximo 2 mídias (imagens ou vídeos) além da capa.' });
        }

        const newClass = new Class({
            title,
            normalizedTitle,
            content,
            subject,
            danger,
            dangerLevel,
            author: userId,
            authorUsername: user.username,
            cover: `/uploads/${coverFile.filename}`,
            medias: medias
        });

        await newClass.save();

        return res.status(201).json({
            message: 'Aula criada com sucesso',
            classId: newClass._id,
            title: newClass.title,
            normalizedTitle: newClass.normalizedTitle,
            cover: newClass.cover,
            medias: newClass.medias
        });
        
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
};



const getClassByTitle = async (req, res) => { //para testes no api tester
    const { classTitle } = req.params

    try {
        if (!classTitle || String(classTitle).trim() === '') {
            return res.status(400).json({ mensagem: "Insira o título da aula que procura" });
        }

        const searchedClass = await Class.findOne({ normalizedTitle: classTitle }) // || await Class.findOne({ title: classTitle });

        if (!searchedClass) {
            return res.status(404).json({ mensagem: "Aula não encontrada pelo título" });
        }

        return res.status(200).json({
            _id: searchedClass._id,
            authorUsername: searchedClass.authorUsername,
            author: searchedClass.author,
            title: searchedClass.title,
            normalizedTitle: searchedClass.normalizedTitle,
            content: searchedClass.content,
            subject: searchedClass.subject,
            danger: searchedClass.danger,
            dangerLevel: searchedClass.dangerLevel,
            cover: searchedClass.cover,
            medias: searchedClass.medias,
            comments: searchedClass.comments,
            ratingAverage: searchedClass.ratingAverage,
            ratingCount: searchedClass.ratingCount,
            reportCount: searchedClass.reportCount,
            createdAt: searchedClass.createdAt
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }

};

const getClassById = async (req, res) => { 
    const { classId } = req.params
    
    if (!classId) {
        return res.status(400).json({mensagem: "Envie a aula a ser procurada"})
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ mensagem: "Formato de ID inválido" });
    }

    try {
        const searchedClass = await Class.findById(classId).populate('author', 'username profilePicture');
        
        if (!searchedClass) {
            return res.status(404).json({ mensagem: "A aula desejada não existe"})
        }

        return res.status(200).json({
            _id: searchedClass._id,
            authorUsername: searchedClass.author ? searchedClass.author.username : searchedClass.authorUsername,
            authorProfilePicture: searchedClass.author ? searchedClass.author.profilePicture : null,
            author: searchedClass.author ? searchedClass.author._id : searchedClass.author,
            title: searchedClass.title,
            normalizedTitle: searchedClass.normalizedTitle,
            content: searchedClass.content,
            subject: searchedClass.subject,
            danger: searchedClass.danger,
            dangerLevel: searchedClass.dangerLevel,
            cover: searchedClass.cover,
            medias: searchedClass.medias,
            comments: searchedClass.comments,
            ratingAverage: searchedClass.ratingAverage,
            ratingCount: searchedClass.ratingCount,
            reportCount: searchedClass.reportCount,
            createdAt: searchedClass.createdAt
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }

};

// Lista paginada das aulas de um autor específico — mesmo padrão do
// getFollowingClasses, só trocando o filtro. Usada na tela de perfil (tanto
// pra "minhas aulas" quanto, no futuro, pra ver as aulas de outra pessoa).
const getClassesByAuthor = async (req, res) => {
    const { userId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ mensagem: "ID de usuário inválido" });
    }

    try {
        const skipIndex = (page - 1) * limit;

        const [classes, totalItems] = await Promise.all([
            Class.find({ author: userId })
                .sort({ createdAt: -1 })
                .skip(skipIndex)
                .limit(limit),
            Class.countDocuments({ author: userId })
        ]);

        return res.status(200).json({
            classes,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error("Erro ao buscar aulas do autor:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const fs = require('fs');
const path = require('path');
const { cascadeDeleteClassPendencies } = require('./adminController');

// Exclui uma aula — só o próprio autor pode excluir a própria aula.
const deleteClass = async (req, res) => {
    const userId = req.userId;
    const { classId } = req.params;

    if (!userId) {
        return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ mensagem: "Formato de ID inválido" });
    }

    try {
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({ mensagem: "Aula não encontrada" });
        }

        if (targetClass.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você só pode excluir suas próprias aulas" });
        }

        // Delete cover image
        if (targetClass.cover && targetClass.cover.startsWith('/uploads/')) {
            const coverPath = path.join(__dirname, '..', 'uploads', targetClass.cover.replace('/uploads/', ''));
            fs.unlink(coverPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error("Erro ao deletar capa da aula:", err);
            });
        }

        // Delete media images
        if (targetClass.medias && targetClass.medias.length > 0) {
            targetClass.medias.forEach(media => {
                if (media.type === 'imagem' && media.value && media.value.startsWith('/uploads/')) {
                    const mediaPath = path.join(__dirname, '..', 'uploads', media.value.replace('/uploads/', ''));
                    fs.unlink(mediaPath, (err) => {
                        if (err && err.code !== 'ENOENT') console.error("Erro ao deletar mídia da aula:", err);
                    });
                }
            });
        }
        
        await cascadeDeleteClassPendencies(classId);

        await targetClass.deleteOne();

        return res.status(200).json({ mensagem: "Aula excluída com sucesso" });
    } catch (err) {
        console.error("Erro ao excluir aula:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const getFollowingClasses = async (req, res) => {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
        return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar o usuário" });
        }

        const followingList = Array.isArray(user.following) ? user.following : [];
        
        if (followingList.length === 0) {
            return res.status(200).json({
                classes: [],
                currentPage: page,
                totalPages: 0
            }); 
        }
        const skipIndex = (page - 1) * limit;

        const classes = await Class.find({ author: { $in: followingList } })
                                   .sort({ ratingSum: -1, createdAt: -1 })
                                   .skip(skipIndex) 
                                   .limit(limit);   

        const totalClasses = await Class.countDocuments({ author: { $in: followingList } });

        return res.status(200).json({
            classes: classes,
            currentPage: page,
            totalPages: Math.ceil(totalClasses / limit),
            totalItems: totalClasses
        });

    } catch(err) {
        console.error("Erro ao buscar aulas dos seguidos:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
}

const searchClass = async (req, res) => {
    const { q, subject } = req.query
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    // teto de 50 pra impedir um ?limit=99999 acidental (ou malicioso) de
    // pedir o banco inteiro de uma vez
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50)
    const skip = (page - 1) * limit
    let filter = {}

    try { 
        if (subject){
            const subjectArray = Array.isArray(subject) ? subject : [subject]
            filter.subject = { $in: subjectArray}
        }

        if (q) {
            filter.$text = { $search: q }
        }

        let query = Class.find(filter)

        if (q) {
            query = query
                .select({ score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } });
        } else {
            query = query.sort({ ratingSum: -1, ratingAverage: -1, createdAt: -1 })
        }

        query = query.skip(skip).limit(limit)

        const [search, totalItems] = await Promise.all([
            query.exec(),
            Class.countDocuments(filter)
        ])

        return res.status(200).json({
            mensagem: search,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: 'Erro no servidor'})
    }
}


const editClass = async (req, res) => {
    const userId = req.userId
    const { classId } = req.params
    const { newContent, newDanger } = req.body

    if (!userId) {
        return res.status(401).json({ mensagem: "É necessário estar autenticado"})
    }
    if (!classId){
        return res.status(400).json({ mensagem: "É necessário o ID da aula desejada"})
    }
    if (!newContent && !newDanger) {
        return res.status(200).json({ mensagem: "Nada foi alterado"})
    }

    try {
        const author = await User.findById(userId)
        if (!author) {
            return res.status(400).json({ mensagem: "Usuário não encontrado"})
        }
        const targetClass = await Class.findById(classId)
        if (!targetClass){
            return res.status(400).json({ mensagem: "Aula não encontrada"})
        }

        if (targetClass.author.toString() !== userId){
            return res.status(403).json({ mensagem: "Você não pode editar a aula de outro usuário"})
        }

        if (newContent && (newContent.length > 4000 || newContent.length < 20)) {
            return res.status(400).json({ mensagem: "O conteúdo deve estar entre 20 e 4000 caracteres"})
        }

        if (newContent) targetClass.content = newContent;
        if (newDanger) targetClass.danger = newDanger;

        await targetClass.save()

        return res.status(200).json({ mensagem: "Aula editada com sucesso"})

    } catch(err) {
        console.error("Erro ao editar aula", err)
        return res.status(500).json({mensagem: "Erro no servidor"})
    }
}


module.exports = {
    createClass,
    getClassByTitle,
    getClassById,
    getClassesByAuthor,
    deleteClass,
    searchClass,
    getFollowingClasses,
    editClass,
};