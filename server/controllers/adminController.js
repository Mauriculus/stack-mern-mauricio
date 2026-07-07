const User = require('../models/User')
const Class = require('../models/Class')
const Comment = require('../models/Comment')
const Response = require('../models/Comment')
const Playlist = require('../models/Playlist')
const Report = require('../models/Report')

const cascadeDeleteClass = async (classId) => {
    const comments = await Comment.deleteMany({commentedClass: classId})

    const responses = await Response.deleteMany({class: classId})

    const removeFromPlaylist = await Playlist.updateMany({ classes: { $in: [classId]}}, { $pull: {classes: classId}})
        
    const reports = await Report.deleteMany({ class: classId })

    return {
        deletedComments: comments.deletedCount,
        deletedResponses: responses.deletedCount,
        modifiedPlaylists: removeFromPlaylist.modifiedCount,
        deletedReports: reports.deletedCount
    }
}

const deleteClass = async (req, res) => {
    const userId = req.userId
    const userType = req.type
    const { classId } = req.params

    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!userId) {
        return res.status(401).json({ mensagem: 'Você deve estar logado para realizar esta ação'})
    }
    if (!classId) {
        return res.status(400).json({ mensagem: "Selecione a aula a ser deletada"})
    }
    try {
        const deletedClass = await Class.findById(classId)

        if (!deletedClass){
            return res.status(404).json({ mensagem: "A aula não foi encontrada"})
        }

        const stats = await cascadeDeleteClass(classId)

        await deletedClass.deleteOne()

        return res.status(200).json({ 
            mensagem: "Aula deletada com sucesso",
            detalhes: `Removida de ${stats.modifiedPlaylists} playlists. ${stats.deletedComments} comentários, ${stats.deletedResponses} respostas e ${stats.deletedReports} denúncias apagados.`
        })
    
    } catch (err){
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}