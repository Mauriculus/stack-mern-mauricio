const User = require('../models/User')
const Class = require('../models/Class')
const { Comment, Response } = require('../models/Comment')
const Playlist = require('../models/Playlist')
const Report = require('../models/Report')

const cascadeDeleteClass = async (bannedUserId) => {
    const classes = await Class.find({ author: bannedUserId }).select('_id')
    let deletedClasses = 0
    let deletedComments = 0
    let deletedResponses = 0
    let modifiedPlaylists = 0
    let deletedReports = 0

    for (const currentClass of classes) {
        const classId = currentClass._id
        const stats = await cascadeDeleteClassPendencies(classId)

        const deletedClass = await Class.findByIdAndDelete(classId)

        if (deletedClass) {
            deletedClasses += 1
            deletedComments += stats.deletedComments
            deletedResponses += stats.deletedResponses
            modifiedPlaylists += stats.modifiedPlaylists
            deletedReports += stats.deletedReports
        }
    }

    return {
        deletedClasses,
        deletedComments,
        deletedResponses,
        modifiedPlaylists,
        deletedReports
    }

}

const cascadeDeleteClassPendencies = async (classId) => {
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
    const userType = req.type
    const { classId } = req.params

    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!classId) {
        return res.status(400).json({ mensagem: "Selecione a aula a ser deletada"})
    }
    try {
        const deletedClass = await Class.findById(classId)

        if (!deletedClass){
            return res.status(404).json({ mensagem: "A aula não foi encontrada"})
        }

        const stats = await cascadeDeleteClassPendencies(classId)

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


const deleteComment = async (req, res) => {
    const userType = req.type
    const { commentId } = req.body

    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!commentId) {
        return res.status(400).json({ mensagem: "Selecione a aula a ser deletada"})
    }

    try { 
        const deletedComment = await Comment.findById(commentId)
        if (!deletedComment){
            return res.status(404).json({ mensagem: "O comentário não foi encontrado"})
        }

        const responses = await Response.deleteMany({ comment: commentId })
        const deletedResponses = responses.deletedCount

        await deletedComment.deleteOne()

        return res.status(200).json({
            mensagem: "Comentário deletado com sucesso",
            detalhes: `Foram deletadas ${deletedResponses} respostas deste comentário`
        })
    } catch(err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}


const deletePlaylist = async (req, res) => {
    const userType = req.type
    const { playlistId } = req.body

    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "Selecione a playlist a ser deletada"})
    }
    try {
        const deletedPlaylist = await Playlist.findById(playlistId)
        if (!deletedPlaylist) {
            return res.status(404).json({ mensagem: "Playlist não encontrada"})
        }

        await deletedPlaylist.deleteOne()

        return res.status(200).json({ mensagem: "Playlist deletada com sucesso" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}


const deleteResponse = async (req, res) => {
    const userType = req.type
    const { responseId } = req.body

    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!responseId) {
        return res.status(400).json({ mensagem: "Selecione a resposta a ser deletada"})
    }
    try {
        const deletedResponse = await Response.findById(responseId)
        if (!deletedResponse) {
            return res.status(404).json({ mensagem: "Resposta não encontrada"})
        }

        await deletedResponse.deleteOne()

        return res.status(200).json({ mensagem: "Resposta deletada com sucesso" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

const banUser = async (req, res) => {
    const userType = req.type
    const { bannedUserId } = req.body
    
    if (userType !== "admin"){
        return res.status(403).json({ mensagem: "É necessário ser administrador para realizar essa ação"})
    }
    if (!bannedUserId) {
        return res.status(400).json({ mensagem: "Selecione o usuário a ser banido"})
    }
    try {
        const user = await User.findById(bannedUserId)
        if (!user) {
            return res.status(404).json({ mensagem: "Usuário não encontrado"})
        }
        if (user.banned === true) {
            return res.status(400).json({ mensagem: "O usuário já está banido"})
        }
        const stats = await cascadeDeleteClass(bannedUserId)

        user.banned = true
        await user.save()

        return res.status(200).json({
            mensagem: "Usuário banido com sucesso",
            detalhes: `Foram removidas ${stats.deletedClasses} aulas, ${stats.deletedComments} comentários, ${stats.deletedResponses} respostas, ${stats.modifiedPlaylists} playlists ajustadas e ${stats.deletedReports} denúncias apagadas.`
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

module.exports = {
    cascadeDeleteClass,
    cascadeDeleteClassPendencies,
    deleteClass,
    deleteComment,
    deletePlaylist,
    deleteResponse,
    banUser
}