const mongoose = require('mongoose');
const User = require('../models/User');


const followUser = async (req, res) => {
  //Pega o ID do usuário que está seguindo (quem faz a ação) e do que está sendo seguido
  const followerId = req.userId || (req.user && req.user._id ? req.user._id.toString() : req.params.userId);
  const { followingId } = req.body;

  //Se o ID do usuário não for encontrado retorna erro
  if (!followingId) {
    return res.status(400).json({ mensagem: 'O ID do usuário a ser seguido é obrigatório' });
  }

  //Checa se os IDs estão no formato correto para o MongoDB e não são só caracteres aleatórios
  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  //Checa se os IDs não são iguais
  if (followerId === followingId) {
    return res.status(400).json({ mensagem: 'Não é possível seguir a si mesmo' });
  }

  try {
    // Tenta adicionar ao conjunto apenas se ainda não estiver seguindo
    const addRes = await User.updateOne(
      { _id: followerId, following: { $ne: followingId } },
      { $addToSet: { following: followingId } }
    );
    //modifiedCount é a quantidade de documentos alterados
    const added = (addRes.modifiedCount ?? addRes.nModified ?? 0) > 0;
    //Se nenhum documento for alterado significa que o usuário já está sendo seguido
    if (!added) {
      return res.status(400).json({ mensagem: 'Você já está seguindo este usuário' });
    }

    // Incrementa contador de followers do usuário seguido
    const incRes = await User.updateOne({ _id: followingId }, { $inc: { followers: 1 } });
    const incUpdated = (incRes.modifiedCount ?? incRes.nModified ?? 0) > 0;

    if (!incUpdated) {
      // rollback: remove o following adicionado para evitar dessincronização
      await User.updateOne({ _id: followerId }, { $pull: { following: followingId } });
      return res.status(404).json({ mensagem: 'Usuário a ser seguido não encontrado' });
    }

    return res.json({ mensagem: 'Usuário seguido com sucesso' });
  } catch (erro) {
    console.error('Erro ao seguir usuário:', erro);
    // tenta rollback conservador caso tenha sido adicionado
    try {
      await User.updateOne({ _id: followerId }, { $pull: { following: followingId } });
    } catch (e) {
      console.error('Rollback falhou:', e);
    }
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


const unfollowUser = async (req, res) => {
  const followerId = req.userId || (req.user && req.user._id ? req.user._id.toString() : req.params.userId);
  const { followingId } = req.body;

  if (!followingId) {
    return res.status(400).json({ mensagem: 'O ID do usuário a deixar de seguir é obrigatório' });
  }

  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  if (followerId === followingId) {
    //remover o usuário se seguindo
    return res.status(400).json({ mensagem: 'Não é possível deixar de seguir a si mesmo' });
  }

  try {
    const pullRes = await User.updateOne(
      { _id: followerId, following: followingId },
      { $pull: { following: followingId } }
    );
    const pulled = (pullRes.modifiedCount ?? pullRes.nModified ?? 0) > 0;
    if (!pulled) {
      return res.status(400).json({ mensagem: 'Você não segue este usuário' });
    }

    const decRes = await User.updateOne(
      { _id: followingId, followers: { $gt: 0 } },
      { $inc: { followers: -1 } }
    );
    const decUpdated = (decRes.modifiedCount ?? decRes.nModified ?? 0) > 0;

    if (!decUpdated) {
      await User.updateOne({ _id: followerId }, { $addToSet: { following: followingId } });
      return res.status(404).json({ mensagem: 'Usuário a ser deixado de seguir não encontrado' });
    }

    return res.json({ mensagem: 'Usuário deixado de seguir com sucesso' });
  } catch (erro) {
    console.error('Erro ao deixar de seguir usuário:', erro);
    try {
      await User.updateOne({ _id: followerId }, { $addToSet: { following: followingId } });
    } catch (e) {
      console.error('Rollback falhou:', e);
    }
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const getFollowingList = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }
  
  try {
    const usuario = await User.findById(userId)
      .select('following')
      .populate('following', 'username profilePicture');

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const followingList = Array.isArray(usuario.following)
      ? usuario.following.map((user) => ({
          username: user.username,
          profilePicture: user.profilePicture,
        }))
      : [];

    return res.json(followingList);
  } catch (erro) {
    console.error('Erro ao buscar lista de seguidos:', erro);
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


module.exports = {
  followUser,
  unfollowUser,
  getFollowingList,
};