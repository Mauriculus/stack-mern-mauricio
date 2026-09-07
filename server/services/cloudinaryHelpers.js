const cloudinary = require('../config/cloudinary');

// Extrai o public_id de uma URL do Cloudinary — só guardamos a URL
// completa no banco, não o public_id separado, então pra poder excluir a
// imagem de lá é preciso reconstruir o id a partir da própria URL
function extractPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    return match ? match[1] : null;
}

// Some silenciosamente se a URL não for do Cloudinary (ex: imagem antiga
// que ainda estava salva localmente antes da migração)
async function deleteCloudinaryImage(url) {
    const publicId = extractPublicId(url);
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Erro ao excluir imagem do Cloudinary:', err);
    }
}

module.exports = { extractPublicId, deleteCloudinaryImage };