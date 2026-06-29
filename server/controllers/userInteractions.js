const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const { Comment, Response } = require('../models/Comment')

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

const comment = async (req, res) => {
  const userId = req.userId;
  const { normalizedTitle } = req.params;
  const { content } = req.body;

  if (!userId) {
    return res.status(401).json({ mensagem: 'Usuário não autenticado' });
  }
  if (!normalizedTitle) {
    return res.status(400).json({ mensagem: 'Aula a ser comentada é obrigatória' });
  }
  if (!content) {
    return res.status(400).json({ mensagem: 'Conteúdo do comentário é obrigatório' });
  }

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const commentedClass = await Class.findOne({ normalizedTitle })

    if (!commentedClass) {
      return res.status(404).json({ mensagem: 'Aula não encontrada' });
    }

    const newComment = new Comment({
      author: userId,
      authorUsername: user.username,
      commentedClass: commentedClass._id,
      classTitle: normalizedTitle,
      content
    })

    await newComment.save()

    commentedClass.comments.push(newComment._id)
    await commentedClass.save()

    return res.status(201).json({
      message: 'Comentário criado com sucesso',
      comment: content,
    })

  } catch (error) {
    console.error('Erro ao comentar:', error);
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}

const respondComment = async (req, res) => {
  const userId = req.userId;
  const { commentId } = req.params;
  const { content } = req.body;

  if (!userId) {
    return res.status(401).json({ mensagem: 'Usuário não autenticado' });
  }
  if (!commentId) {
    return res.status(400).json({ mensagem: 'Comentário a ser respondido é obrigatório' });
  }
  if (!content) {
    return res.status(400).json({ mensagem: 'Conteúdo da resposta é obrigatório' });
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ mensagem: 'Comentário não encontrado' });
    }

    const newResponse = new Response({ 
      author: userId,
      authorUsername: user.username,
      comment: commentId,
      class: comment.commentedClass,
      content
    })
    await newResponse.save()
    
    comment.responses.push(newResponse._id)
    await comment.save()

    return res.status(201).json({
      message: 'Resposta criada com sucesso',
      response: content, 
    })

  } catch (error) {
    console.error('Erro ao responder comentário:', error);
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}


const getCommentsByClass = async (req, res) => { 
  const { normalizedTitle } = req.params;

  if (!normalizedTitle) {
    return res.status(400).json({ mensagem: 'Aula é obrigatória' });
  }

  try {
    const comments = await Comment.find({ classTitle: normalizedTitle })
      .populate({
        path: 'author',
        select: 'username profilePicture'
      })
      .populate({
        path: 'responses',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      })
      .sort({ createdAt: -1 })

    return res.status(200).json({
      mensagem: 'Comentários recuperados com sucesso',
      total: comments.length,
      comments: comments.map(comment => ({
        _id: comment._id,
        author: {
          _id: comment.author._id,
          username: comment.author.username,
          profilePicture: comment.author.profilePicture
        },
        content: comment.content,
        createdAt: comment.createdAt,
        responses: comment.responses.map(response => ({
          _id: response._id,
          author: {
            _id: response.author._id,
            username: response.author.username,
            profilePicture: response.author.profilePicture
          },
          content: response.content,
          createdAt: response.createdAt
        }))
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}


module.exports = {
  followUser,
  unfollowUser,
  getFollowingList,
  comment,
  respondComment,
  getCommentsByClass
};

