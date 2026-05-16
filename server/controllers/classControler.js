const Class = require('../models/Class');

const createClass = async (req, res) => {
    const { title, subject, danger, dangerLevel, content } = req.body;
    try {
        const newClass = new Class({ 
            author: req.userId,
            title,
            subject,
            danger,
            dangerLevel,
            content
        })
        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar aula' });
    }
};

module.exports = {
    createClass
}