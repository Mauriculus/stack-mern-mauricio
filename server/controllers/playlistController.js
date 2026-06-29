const Playlist = require('../models/Playlist');
const Class = require('../models/Class');


const createPlaylist = async (req, res) => { 
    const { name, description, classIds } = req.body;
    const userId = req.userId

    const normalizeName = (value) =>
    value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');

    if (!userId){
        return res.status(400).json({ mensagem: "Você deve estar logado para conseguir criar uma playlist"})
    }
    if (!name || !description) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" }) 
    }

    const classIdsArray = Array.isArray(classIds) ? classIds : []
    if (!classIdsArray.length){
        return res.status(400).json({ mensagem: "Adicione pelo menos uma aula à playlist"})
    }

    const hasDuplicateClasses = new Set(classIdsArray.map(String)).size !== classIdsArray.length;
    if (hasDuplicateClasses) {
        return res.status(400).json({ mensagem: "Existem aulas repetidas na playlist" });
    }

    try {
        const normalizedName = normalizeName(name)
        const nameExists = await Playlist.findOne({normalizedName})

        if (nameExists){
            return res.status(400).json({mensagem: "Já existe uma playlist com esse nome"})
        }       

        const verifyClasses = await Class.find({ _id: { $in: classIdsArray }})
        if (verifyClasses.length !== classIdsArray.length){
            return res.status(400).json({ mensagem: "Uma ou mais aulas inseridas não existem"})
        }

        const playlist = await new Playlist({
            author: userId,
            name,
            normalizedName,
            description,
            classes: classIdsArray
        })
        await playlist.save()
        
        return res.status(201).json({mensagem: "Playlist criada com sucesso"})

    } catch(err) {
        console.error(err)
        return res.status(500).json({mensagem: "Erro no servidor"})
    }
}

const addClassToPlaylist = async (req, res) => {
    const { newClassId } = req.body
    const { playlistId } = req.params
    const userId = req.userId
    
    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para adicionar itens à playlist"})
    }
    if (!newClassId) {
        return res.status(400).json({ mensagem: "Escolha a aula que quer adicionar à playlist"})
    }
    try{
        const playlist = await Playlist.findById(playlistId)
        if (!playlist){
            return res.status(404).json({ mensagem: "A playlist é inválida"})
        }
        const classExists = await Class.findById(newClassId)
        if (!classExists){
            return res.status(404).json({ mensagem: "A aula inserida é inválida"})
        }
        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode editar uma playlist que não é sua" });
        }   

        await Playlist.updateOne({ _id: playlistId }, { $addToSet: {classes: newClassId} })
        return res.status(200).json({ mensagem: `Aula ${newClassId} adicionada à playlist ${playlistId}`})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

const reorderPlaylist = async (req, res) => {
    const userId = req.userId
    const { classes } = req.body
    const { playlistId } = req.params

    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para editar playlists"})
    }
    if (!classes){
        return res.status(400).json({ mensagem: "As aulas da playlist não foram enviadas"})
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "Não foi possível pegar o ID da playlist"})
    }

    const classIdsArray = Array.isArray(classIds) ? classIds : []
    if (!classIdsArray.length){
        return res.status(400).json({ mensagem: "As aulas devem ser enviadas em um array"})
    }

    try { 
        const playlist = await Playlist.findById(playlistId)

        if (!playlist) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar a playlist" })
        }

        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode editar uma playlist que não é sua"})
        }

        const oldClasses = playlist.classes.map(id => id.toString()).sort();
        const newClasses = classes.map(id => id.toString()).sort();

        if (JSON.stringify(oldClasses) !== JSON.stringify(newClasses)) {
            return res.status(400).json({ mensagem: "As aulas da playlist foram alteradas"})
        }

        playlist.classes = classes

        await playlist.save()
        return res.status(200).json({ mensagem: "Ordem das aulas atualizada com sucesso"})


    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}


const removeClassFromPlaylist = async (req, res) => {
    const { removeClassId } = req.body
    const { playlistId } = req.params
    const userId = req.userId
    
    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para editar playlists"})
    }
    if (!removeClassId) {
        return res.status(400).json({ mensagem: "Escolha a aula que quer remover da playlist"})
    }
    try{
        const playlist = await Playlist.findById(playlistId)
        if (!playlist){
            return res.status(404).json({ mensagem: "A playlist é inválida"})
        }
        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode editar uma playlist que não é sua" });
        }   

        await Playlist.updateOne({ _id: playlistId }, { $pull: {classes: removeClassId} })
        return res.status(200).json({ mensagem: `Aula ${removeClassId} removida da playlist ${playlistId}`})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
};

const deletePlaylist = async (req, res) => {
    const userId = req.userId
    const { playlistId } = req.params

    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para realizar essa ação"})
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "Não foi possível pegar o ID da playlist"})
    }

    try {
        const playlist = await Playlist.findById(playlistId)

        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode excluir a playlist de outro usuário"})
        }

        await Playlist.deleteOne({ _id: playlistId})

        return res.stauts(201).json({ mensagem: "A playlist foi deletada"})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}


module.exports = {
    createPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,

    deletePlaylist,
}