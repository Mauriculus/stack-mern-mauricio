const { urlencoded } = require('express');
const Class = require('../models/Class');
const User = require("../models/User")


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
            authorUsername: searchedClass.authorUsername,
            author: searchedClass.author,
            title: searchedClass.title,
            content: searchedClass.content,
            subject: searchedClass.subject,
            danger: searchedClass.danger,
            dangerLevel: searchedClass.dangerLevel,
            cover: searchedClass.cover,
            medias: searchedClass.medias,
            comments: searchedClass.comments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }

};

const searchClass = async (req, res) => {
    const { q, subject } = req.query
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
            query = query.sort({ ratingSum: -1, createdAt: -1 }).limit(20)
        }

        const search = await query.exec()

        return res.status(200).json({ mensagem: search})
    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: 'Erro no servidor'})
    }
}

module.exports = {
    createClass,
    getClassByTitle,
    searchClass,
};