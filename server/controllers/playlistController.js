const Playlist = require('../models/Playlist');
const Class = require('../models/Class');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');


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
        return res.status(400).json({ mensagem: "As aulas devem ser enviadas em um array"})
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

        const addRes = await Playlist.updateOne({ _id: playlistId }, { $addToSet: {classes: newClassId} })
        const added = (addRes.modifiedCount ?? addRes.nModified ?? 0) > 0;
        if (!added){
            return res.status(400).json({ mensagem: "A aula selecionada já estava na playlist"})
        }

        return res.status(200).json({ mensagem: `Aula ${newClassId} adicionada à playlist ${playlistId}`})

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

        const removeRes = await Playlist.updateOne({ _id: playlistId }, { $pull: {classes: removeClassId} })

        const removed = (removeRes.modifiedCount ?? removeRes.nModified ?? 0) > 0;
        if (!removed){
            return res.status(400).json({ mensagem: "A aula selecionada não está na playlist"})
        }

        return res.status(200).json({ mensagem: `Aula ${removeClassId} removida da playlist ${playlistId}`})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
};


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

    const classIdsArray = Array.isArray(classes) ? classes : []
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


const deletePlaylist = async (req, res) => {
    const userId = req.userId
    const { playlistId } = req.body

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

        return res.status(201).json({ mensagem: "A playlist foi deletada"})

    } catch (err) {
        console.error(err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

const changePlaylistPrivacy = async (req, res) => {
    const userId = req.userId
    const { playlistId } = req.params

    if (!userId) {
        return res.status(401).json({ mensagem: "É necessário estar logado para fazer essa ação"})
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "É necessário o ID da playlist para realizar essa ação"})
    }

    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar a playlist desejada"})
        }
        if (playlist.author.toString() !== userId.toString()) {
            return res.status(403).json({ mensagem: "Você não é dono dessa playlist"})
        }
        if (playlist.private === true) {
            playlist.private = false
            await playlist.save()
            return res.status(200).json({ mensagem: "A playlist agora é pública"})
        } 
        if (playlist.private === false) {
            playlist.private = true
            await playlist.save()
            return res.status(200).json({ mensagem: "A playlist agora é privada"})
        } else {
            return res.status(500).json({ mensagem: "A privacidade da playlist tem valor nulo"})
        }
    } catch (err) {
        console.error("Erro ao alterar a privacidade da playlist ", err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}


const editPlaylist = async (req, res) => {
    const userId = req.userId;
    const { playlistId } = req.params;
    const { name, description, isPrivate } = req.body;
    
    // multer provides the file in req.file if sent
    const coverFile = req.file ? req.file.filename : undefined;

    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para editar playlists" });
    }

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ mensagem: "Playlist não encontrada" });
        }
        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não é o dono dessa playlist" });
        }

        if (name) {
            playlist.name = name;
            playlist.normalizedName = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
        }
        if (description !== undefined) {
            playlist.description = description;
        }
        if (isPrivate !== undefined) {
            playlist.private = isPrivate === 'true' || isPrivate === true;
        }

        if (coverFile) {
            if (playlist.cover) {
                const oldCoverPath = path.join(__dirname, '..', 'uploads', playlist.cover);
                fs.unlink(oldCoverPath, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error("Erro ao deletar capa antiga:", err);
                    }
                });
            }
            playlist.cover = coverFile;
        }

        await playlist.save();
        return res.status(200).json({ mensagem: "Playlist atualizada com sucesso", playlist });
    } catch (err) {
        console.error("Erro ao editar playlist:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const ratePlaylist = async (req, res) => {
    const rate = Number(req.body.rate);
    const userId = req.userId;
    const { playlistId } = req.params;

    if (isNaN(rate) || rate < 0 || rate > 5) {
        return res.status(400).json({ mensagem: "Nota inválida" });
    }
    if (!userId) return res.status(401).json({ mensagem: "Você deve estar logado" });

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ mensagem: "Playlist não encontrada" });
        if (playlist.private) return res.status(403).json({ mensagem: "Não é possível avaliar playlists privadas" });

        const user = await User.findById(userId);
        if (user.banned) return res.status(403).json({ mensagem: "Você está banido" });

        const currentSum = Number(playlist.ratingSum) || 0;
        const currentCount = Number(playlist.ratingCount) || 0;
        const alreadyRated = user.ratedPlaylists.find(item => item.playlistsIds.toString() === playlistId);

        if (alreadyRated) {
            const oldRate = Number(alreadyRated.rate);
            if (oldRate === rate) return res.status(200).json({ mensagem: "A nota foi mantida a mesma" });

            const newSum = currentSum - oldRate + rate;
            const newAverage = newSum / currentCount;

            playlist.ratingSum = newSum;
            playlist.ratingAverage = newAverage;
            alreadyRated.rate = rate;

            await playlist.save();
            await user.save();
            return res.status(200).json({ mensagem: `Sua avaliação foi alterada para ${rate}` });
        }

        const newCount = currentCount + 1;
        const newSum = currentSum + rate;
        playlist.ratingCount = newCount;
        playlist.ratingSum = newSum;
        playlist.ratingAverage = newSum / newCount;

        user.ratedPlaylists.push({ playlistsIds: playlistId, rate });
        
        await playlist.save();
        await user.save();
        
        return res.status(200).json({ mensagem: "Playlist avaliada com sucesso" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const getTopPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ private: false })
            .sort({ ratingSum: -1 })
            .limit(12)
            .populate('author', 'username profilePicture')
            .populate('classes', 'title duration');
        
        return res.status(200).json({ playlists });
    } catch (err) {
        console.error("Erro ao buscar playlists:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const getUserPlaylists = async (req, res) => {
    const { userId } = req.params;
    const isOwner = req.userId === userId;

    try {
        const filter = { author: userId };
        if (!isOwner) {
            filter.private = false;
        }

        const playlists = await Playlist.find(filter)
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });

        return res.status(200).json({ playlists });
    } catch (err) {
        console.error("Erro ao buscar playlists do usuário:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const getPlaylistById = async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.userId;

    try {
        const playlist = await Playlist.findById(playlistId)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'classes',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!playlist) return res.status(404).json({ mensagem: "Playlist não encontrada" });

        if (playlist.private && (!userId || playlist.author._id.toString() !== userId)) {
            return res.status(403).json({ mensagem: "Esta playlist é privada" });
        }

        return res.status(200).json(playlist);
    } catch (err) {
        console.error("Erro ao buscar playlist:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

module.exports = {
    createPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    changePlaylistPrivacy,
    editPlaylist,
    ratePlaylist,
    getTopPlaylists,
    getUserPlaylists,
    getPlaylistById
};