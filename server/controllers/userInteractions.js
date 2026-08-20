const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Report = require ('../models/Report')
const { Comment, Response } = require('../models/Comment');
const { find } = require('../models/Appointment');


const followUser = async (req, res) => {
  const followerId = req.userId
  const { followingId } = req.body;

  if (!followingId) {
    return res.status(400).json({ mensagem: 'O ID do usuário a ser seguido é obrigatório' });
  }

  if (!followerId) {
    return res.status(400).json({ mensagem: 'É necessário estar logado para seguir alguém' });
  }

  //Checa se os IDs não são iguais
  if (followerId === followingId) {
    return res.status(400).json({ mensagem: 'Não é possível seguir a si mesmo' });
  }

  try {
    const follower = await User.findById(followerId)
    if (!follower) {
      return res.status(401).json({ mensagem: "Usuário não encontrado"})
    }
    const following = await User.findById(followingId)
    if(!following){
      return res.status(404).json({ mensagem: "Usuário a ser seguido não encontrado"})
    }
    if (follower.banned === true ){
      return res.status(403).json({ mensagem: "Você está banido"})
    }
 
    const addRes = await follower.updateOne({ $addToSet: { following: followingId }});

    //modifiedCount é a quantidade de documentos alterados
    const added = (addRes.modifiedCount ?? addRes.nModified ?? 0) > 0;
    //Se nenhum documento for alterado significa que o usuário já está sendo seguido
    if (!added) {
      return res.status(400).json({ mensagem: 'Você já está seguindo este usuário' });
    }

    // Incrementa contador de followers do usuário seguido
    const incRes = await following.updateOne({ $inc: { followers: 1 } });
    const incUpdated = (incRes.modifiedCount ?? incRes.nModified ?? 0) > 0;

    if (!incUpdated) {
      // rollback: remove o following adicionado para evitar dessincronização
      await follower.updateOne({ $pull: { following: followingId } });
      return res.status(404).json({ mensagem: 'Usuário a ser seguido não encontrado' });
    }

    return res.json({ mensagem: 'Usuário seguido com sucesso' });
  } catch (err) {
    console.error('Erro ao seguir usuário:', err);
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
          _id: user._id,
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

// Controladores de comentário e respostas

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

    if (user.banned === true) {
      return res.status(403).json({mensagem: "Você está banido"})
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
      commentId: newComment._id,
      comentário: content,
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
    if (user.banned === true) {
      return res.status(403).json({mensagem: "Você está banido"})
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
      mensagem: 'Resposta criada com sucesso',
      responseId: newResponse._id,
      resposta: content, 
    })

  } catch (error) {
    console.error('Erro ao responder comentário:', error);
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}


const getCommentsByClass = async (req, res) => { 
  const { normalizedTitle } = req.params;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  // mesmo teto de segurança usado no searchClass, pra não deixar pedir a
  // lista inteira de comentários de uma vez só
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  if (!normalizedTitle) {
    return res.status(400).json({ mensagem: 'Aula é obrigatória' });
  }

  try {
    const [comments, totalItems] = await Promise.all([
      Comment.find({ classTitle: normalizedTitle })
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
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ classTitle: normalizedTitle })
    ])

    return res.status(200).json({
      mensagem: 'Comentários recuperados com sucesso',
      total: totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
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

// Controlador de avaliação e report

const rateClass = async (req, res) => {
  const rate = Number(req.body.rate);
  const userId = req.userId;
  const { classId } = req.params;

  if (isNaN(rate)) {
    return res.status(400).json({ mensagem: "Nenhuma nota válida foi inserida, nada alterado" });
  }
  if (rate < 0 || rate > 5) {
    return res.status(400).json({ mensagem: "Sua nota deve estar entre 0 e 5" });
  }
  if (!userId) {
    return res.status(401).json({ mensagem: "Você deve estar logado para avaliar" });
  }
  if (!classId) {
    return res.status(400).json({ mensagem: "Insira a aula que quer avaliar" });
  }

  try {
    const ratedClass = await Class.findById(classId);
    if (!ratedClass) {
      return res.status(404).json({ mensagem: "Não foi possível encontrar a aula" });
    }
    const user = await User.findById(userId);
    if (user.banned === true) {
      return res.status(403).json({ mensagem: "Você está banido" });
    }

    const currentSum = Number(ratedClass.ratingSum) || 0;
    const currentCount = Number(ratedClass.ratingCount) || 0;

    const alreadyRated = user.ratedClasses.find(item => item.classesIds.toString() === classId);

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
      
      ratedClass.ratingSum = newSum;
      ratedClass.ratingAverage = newAverage;

      alreadyRated.rate = rate;

      await ratedClass.save();
      await user.save();

      return res.status(200).json({ mensagem: `Sua avaliação foi alterada de ${oldRate} para ${rate}` });
    }

    const newCount = currentCount + 1;
    const newSum = currentSum + rate;
    const newAverage = newSum / newCount;

    if (newAverage < 0 || newAverage > 5) {
      return res.status(400).json({ mensagem: "A média não está na faixa de notas permitidas" });
    }

    ratedClass.ratingCount = newCount;
    ratedClass.ratingSum = newSum;
    ratedClass.ratingAverage = newAverage;

    user.ratedClasses.push({ classesIds: classId, rate: rate });
    
    await user.save();
    await ratedClass.save();
    
    return res.status(200).json({ mensagem: "Aula avaliada com sucesso" });

  } catch (err){
    console.error(err);
    return res.status(500).json({ mensagem: "Erro no servidor" });
  }
}


const availableReasons = ["Conteúdo incorreto ou perigoso", 
            "Linguagem inapropriada",
            "Conteúdo fora do tema do site",
            "Plágio ou cópia indevida",
            "Spam ou propaganda",
            "Imagens ou vídeos inapropriados",
            "Informações desatualizadas",
            "Título ou nome de usuário inapropriado",
            "Outro"]


const reportClass = async (req, res) => {
  const userId = req.userId
  const { classId } = req.params
  const { reason, text } = req.body

  if (!userId) {
    return res.status(401).json({ mensagem: "Deve estar logado para denunciar uma aula"})
  }
  if (!classId) {
    return res.status(400).json({ mensagem: "Não foi possível conseguir a aula a ser denunciada"})
  }
  if (!reason) {
    return res.status(400).json({ mensagem: "Selecione a razão da denuncia"})
  }
  if (!availableReasons.includes(reason)) {
    return res.status(400).json({ mensagem: "Selecione uma das razões da denúncia"})
  }
  try {


    const reportedClass = await Class.findById(classId)
    if (!reportedClass){
      return res.status(404).json({ mensagem: "Aula inválida"})
    }

    const newReport = new Report({
      author: userId,
      class: classId,
      reason,
      text
    })

    await newReport.save()
    
    reportedClass.reports.push(newReport._id);
    reportedClass.reportCount += 1;

    await reportedClass.save()

    return res.status(201).json({mensagem: "Aula denunciada"})


  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: "Erro no servidor"})
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowingList,
  comment,
  respondComment,
  getCommentsByClass,
  rateClass,
  reportClass,
};