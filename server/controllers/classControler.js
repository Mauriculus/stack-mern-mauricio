const Class = require('../models/Class');

// Criar nova aula
const createClass = async (req, res) => {
    const { title, subject, danger, dangerLevel, pages } = req.body;
    try {
        const newClass = new Class({ 
            author: req.userId,
            title,
            subject,
            danger,
            dangerLevel,
            pages
        })
        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar aula' });
    }
};
