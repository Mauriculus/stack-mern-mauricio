const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "sobrevivencia-domestica",
        allowed_formats: ["png", "jpeg", "jpg", "webp", "gif"],
    },
})

const fileFilter = (req, file, callback) => {
    const allowedType = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    
    if (allowedType.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(new Error("Tipo inválido de arquivo, envie apenas imagens (png, jpeg, gif, webp)"), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})
module.exports = upload