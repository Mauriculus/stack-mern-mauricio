const multer = require("multer")
const path = require ("path")

const storage = multer.diskStorage ({
    destination: path.join(__dirname, "..", "uploads"),
    filename: function (req, file, callback) {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        callback(null, suffix + path.extname(file.originalname))
    }
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
        fileSize: 5 * 1024 * 1024
    }
})
module.exports = upload