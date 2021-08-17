const multer = require('multer');
var path = require('path');

// storage engine
const multerStorage = (dirName) => {
    return multer.diskStorage({
        destination: `public/img/${dirName}`,
        filename: (req, file, cB) => {
            cB(null, file.fieldname + '-' + Date.now() +
            path.extname(file.originalname))
        }
    })
}

// uploader middleware
const uploader = async (req, res, storage) => {
    const upload = multer({
        storage,
        limits: { fileSize: 2_000_000 },
        fileFilter: (req, file, cB) => {
            checkFileType(file, cB)
        }
    }).single('newImg')

    return await new Promise((resolve) => {
        upload(req, res, (err) => {
            if (err) {
                console.log(err);
                res.status(413).send({ error: err })
            } else {
                resolve(req?.file?.filename)
            }
        })
    })
}


const checkFileType = (file, cB) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|jfif/
    const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeTypes = allowedFileTypes.test(file.mimetype)
    if (extName && mimeTypes) return cB(null, true)
    cB('Only Images of allowed filetypes can be uploaded')
}

module.exports = {
    multerStorage,
    uploader
}