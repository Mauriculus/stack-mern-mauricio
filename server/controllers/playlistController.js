const Playlist = require('../models/Playlist');
const { deleteCloudinaryImage } = require('../services/cloudinaryHelpers');
const Class = require('../models/Class');
const User = require('../models/User');

const normalizeName = (value) =>
    value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');

const createPlaylist = async (req, res) => { 
    const { name, description, classIds, private: privateInput } = req.body;
    const userId = req.userId
    const coverFile = req.file;

    if (!userId){
        return res.status(401).json({ mensagem: "Você deve estar logado para conseguir criar uma playlist"})
    }
    if (!name || !description) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" }) 
    }
    if (!coverFile) {
        return res.status(400).json({ mensagem: "A imagem de capa é obrigatória" })
    }

    const classIdsArray = Array.isArray(classIds) ? classIds : (classIds ? [classIds] : []);

    const hasDuplicateClasses = new Set(classIdsArray.map(String)).size !== classIdsArray.length;
    if (hasDuplicateClasses) {
        return res.status(400).json({ mensagem: "Existem aulas repetidas na playlist" });
    }

    const isPrivate = privateInput === 'false' ? false : true;

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        const normalizedName = normalizeName(name)   

        if (classIdsArray.length) {
            const verifyClasses = await Class.find({ _id: { $in: classIdsArray }})
            if (verifyClasses.length !== classIdsArray.length){
                return res.status(400).json({ mensagem: "Uma ou mais aulas inseridas não existem"})
            }
        }

        const playlist = new Playlist({
            author: userId,
            name,
            normalizedName,
            description,
            cover: coverFile.path,
            classes: classIdsArray,
            private: isPrivate,
        })
        await playlist.save()
        
        return res.status(201).json({
            mensagem: "Playlist criada com sucesso",
            playlistId: playlist._id,
            playlist,
        })

    } catch(err) {
        console.error(err)
        return res.status(500).json({mensagem: "Erro no servidor"})
    }
}

// playlists do próprio usuário logado (públicas e privadas) — usado na aba
// "Playlists" do perfil e no modal de "adicionar à playlist"
const getMyPlaylists = async (req, res) => {
    const userId = req.userId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    if (!userId) {
        return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }

    try {
        const skipIndex = (page - 1) * limit;
        const filter = { author: userId };

        const [playlists, totalItems] = await Promise.all([
            Playlist.find(filter).sort({ createdAt: -1 }).skip(skipIndex).limit(limit),
            Playlist.countDocuments(filter)
        ]);

        return res.status(200).json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

// playlists públicas, ordenadas por ratingSum — usado na tela de pesquisa
const getPublicPlaylists = async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    try {
        const filter = { private: false };
        const skipIndex = (page - 1) * limit;

        const [playlists, totalItems] = await Promise.all([
            Playlist.find(filter).sort({ ratingSum: -1, createdAt: -1 }).skip(skipIndex).limit(limit),
            Playlist.countDocuments(filter)
        ]);

        return res.status(200).json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const getPlaylistsByAuthor = async (req, res) => {
    const { userId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    try {
        const filter = { author: userId, private: false };
        const skipIndex = (page - 1) * limit;

        const [playlists, totalItems] = await Promise.all([
            Playlist.find(filter).sort({ createdAt: -1 }).skip(skipIndex).limit(limit),
            Playlist.countDocuments(filter)
        ]);

        return res.status(200).json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

// playlists públicas de gente que o usuário segue — privadas nunca aparecem
// aqui, mesmo sendo de alguém que você segue
const getFollowingPlaylists = async (req, res) => {
    const userId = req.userId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

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
            return res.status(200).json({ playlists: [], currentPage: page, totalPages: 0, totalItems: 0 });
        }

        const filter = { author: { $in: followingList }, private: false };
        const skipIndex = (page - 1) * limit;

        const [playlists, totalItems] = await Promise.all([
            Playlist.find(filter).sort({ ratingSum: -1, createdAt: -1 }).skip(skipIndex).limit(limit),
            Playlist.countDocuments(filter)
        ]);

        return res.status(200).json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

// detalhe de uma playlist, com as aulas já populadas (título, capa etc) —
// usado na tela de ver/editar playlist
const getPlaylistById = async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.userId;

    try {
        const playlist = await Playlist.findById(playlistId)
            .populate('classes', 'title cover normalizedTitle subject ratingAverage ratingCount')
            .populate('author', 'username');

        if (!playlist) {
            return res.status(404).json({ mensagem: "Playlist não encontrada" });
        }

        const donoId = playlist.author?._id?.toString();
        const souDono = Boolean(userId) && donoId === userId;

        if (playlist.private && !souDono) {
            return res.status(403).json({ mensagem: "Essa playlist é privada" });
        }

        // devolve author como string (id puro) igual antes, pra não quebrar
        // as comparações que já existem no frontend (playlist.author === meuId)
        const playlistObj = playlist.toObject();
        playlistObj.authorUsername = playlist.author?.username || playlistObj.authorUsername;
        playlistObj.author = donoId;

        return res.status(200).json(playlistObj);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

const editPlaylist = async (req, res) => {
    const userId = req.userId;
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const coverFile = req.file;

    if (!userId) {
        return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ mensagem: "Playlist não encontrada" });
        }
        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode editar uma playlist que não é sua" });
        }

        if (name && name.trim()) {
            const novoNomeNormalizado = normalizeName(name);
            playlist.name = name.trim();
            playlist.normalizedName = novoNomeNormalizado;
        }

        if (description && description.trim()) {
            playlist.description = description.trim();
        }

        if (coverFile) {
            if (playlist.cover) {
                const aindaEmUso = await Playlist.exists({ cover: playlist.cover, _id: { $ne: playlistId } });
                if (!aindaEmUso) {
                    await deleteCloudinaryImage(playlist.cover);
                }
            }

            playlist.cover = coverFile.path;
        }

        await playlist.save();

        return res.status(200).json({ mensagem: "Playlist atualizada com sucesso", playlist });
    } catch (err) {
        console.error("Erro ao editar playlist:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

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
    const userId = req.userId;
    const { playlistId } = req.body;

    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para realizar essa ação" });
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "Não foi possível pegar o ID da playlist" });
    }

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ mensagem: "Playlist não encontrada" });
        }

        if (playlist.author.toString() !== userId) {
            return res.status(403).json({ mensagem: "Você não pode excluir a playlist de outro usuário" });
        }
        
        if (playlist.cover) {
            const aindaEmUso = await Playlist.exists({ cover: playlist.cover, _id: { $ne: playlistId } });
            if (!aindaEmUso) {
                await deleteCloudinaryImage(playlist.cover);
            }
        }

        await Playlist.deleteOne({ _id: playlistId });

        return res.status(200).json({ mensagem: "A playlist foi deletada" });

    } catch (err) {
        console.error("Erro ao deletar playlist:", err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};

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
            return res.status(200).json({ mensagem: "A playlist agora é pública", private: false})
        } 
        if (playlist.private === false) {
            playlist.private = true
            await playlist.save()
            return res.status(200).json({ mensagem: "A playlist agora é privada", private: true})
        } else {
            return res.status(500).json({ mensagem: "A privacidade da playlist tem valor nulo"})
        }
    } catch (err) {
        console.error("Erro ao alterar a privacidade da playlist ", err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

// nota de 0 a 5 — mesma lógica do rateClass, só que guardando em
// user.ratedPlaylists em vez de user.ratedClasses
const ratePlaylist = async (req, res) => {
    const rate = Number(req.body.rate);
    const userId = req.userId;
    const { playlistId } = req.params;

    if (isNaN(rate)) {
        return res.status(400).json({ mensagem: "Nenhuma nota válida foi inserida, nada alterado" });
    }
    if (rate < 0 || rate > 5) {
        return res.status(400).json({ mensagem: "Sua nota deve estar entre 0 e 5" });
    }
    if (!userId) {
        return res.status(401).json({ mensagem: "Você deve estar logado para avaliar" });
    }
    if (!playlistId) {
        return res.status(400).json({ mensagem: "Insira a playlist que quer avaliar" });
    }

    try {
        const ratedPlaylist = await Playlist.findById(playlistId);
        if (!ratedPlaylist) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar a playlist" });
        }
        const user = await User.findById(userId);
        if (user.banned === true) {
            return res.status(403).json({ mensagem: "Você está banido" });
        }

        const currentSum = Number(ratedPlaylist.ratingSum) || 0;
        const currentCount = Number(ratedPlaylist.ratingCount) || 0;

        const alreadyRated = (user.ratedPlaylists || []).find(
            item => item.playlistId.toString() === playlistId
        );

        if (alreadyRated) {
            const oldRate = Number(alreadyRated.rate);

            if (oldRate === rate) {
                return res.status(200).json({ mensagem: "A nota foi mantida a mesma" });
            }

            const newSum = currentSum - oldRate + rate;
            const newAverage = newSum / currentCount;

            if (newAverage < 0 || newAverage > 5) {
                return res.status(400).json({ mensagem: "A média não está na faixa de notas permitidas" });
            }

            ratedPlaylist.ratingSum = newSum;
            ratedPlaylist.ratingAverage = newAverage;
            alreadyRated.rate = rate;

            await ratedPlaylist.save();
            await user.save();

            return res.status(200).json({ mensagem: `Sua avaliação foi alterada de ${oldRate} para ${rate}` });
        }

        const newCount = currentCount + 1;
        const newSum = currentSum + rate;
        const newAverage = newSum / newCount;

        if (newAverage < 0 || newAverage > 5) {
            return res.status(400).json({ mensagem: "A média não está na faixa de notas permitidas" });
        }

        ratedPlaylist.ratingCount = newCount;
        ratedPlaylist.ratingSum = newSum;
        ratedPlaylist.ratingAverage = newAverage;

        if (!user.ratedPlaylists) user.ratedPlaylists = [];
        user.ratedPlaylists.push({ playlistId: playlistId, rate: rate });

        await user.save();
        await ratedPlaylist.save();

        return res.status(200).json({ mensagem: "Playlist avaliada com sucesso" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};


const copyPlaylist = async (req, res) => {
    const userId = req.userId
    const { playlistId } = req.body

    if(!userId) {
        return res.status(401).json({ mensagem: "É necessário estar autenticado para realizar essa ação"})
    }
    if(!playlistId){
        return res.status(400).json({ mensagem: "Envie o ID da playlist desejada"})
    }
    try {
        const copiedPlaylist = await Playlist.findById(playlistId)
        
        if (!copiedPlaylist) {
            return res.status(404).json({ mensagem: "Não foi possível encontrar a playlist desejada"})
        }

        if(copiedPlaylist.author.toString() !== userId && copiedPlaylist.private) {
            return res.status(400).json({ mensagem: "Essa playlis é privada"})
        }

        const playlist = new Playlist ({
            author: userId,
            name: copiedPlaylist.name,
            normalizedName: copiedPlaylist.normalizedName,
            cover: copiedPlaylist.cover,
            description: copiedPlaylist.description,
            private: true,
            classes: copiedPlaylist.classes
        })

        await playlist.save()

        return res.status(201).json({ mensagem: "Playlist copiada com sucesso", playlist})
    } catch (err) {
        console.error("Erro ao copiar playlis ", err)
        return res.status(500).json({ mensagem: "Erro no servidor"})
    }
}

const searchPlaylists = async (req, res) => {
    const { q } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    try {
        const filter = { private: false };

        if (q && q.trim()) {
            filter.$text = { $search: q.trim() };
        }

        let query = Playlist.find(filter);

        if (q && q.trim()) {
            query = query
                .select({ score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            query = query.sort({ ratingSum: -1, createdAt: -1 });
        }

        query = query.skip(skip).limit(limit);

        const [playlists, totalItems] = await Promise.all([
            query.exec(),
            Playlist.countDocuments(filter)
        ]);

        return res.status(200).json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro no servidor" });
    }
};




module.exports = {
    createPlaylist,
    getMyPlaylists,
    getPublicPlaylists,
    getPlaylistsByAuthor,
    getFollowingPlaylists,
    getPlaylistById,
    editPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    changePlaylistPrivacy,
    ratePlaylist,
    copyPlaylist,
    searchPlaylists,
}