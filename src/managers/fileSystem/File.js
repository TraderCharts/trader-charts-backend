import multer from 'multer';

class File {
    constructor(fileName) {
        const storageOptions = {
            destination: function (req, file, cb) {
                cb(null, 'uploads/')
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        };
        const diskStorage = multer.diskStorage(storageOptions);
        const configLimit = {
            files: 1,
            fileSize: 2 * 1024 * 1024 // 2mb, in bytes
        };
        this._fileInformation = multer({storage: diskStorage, limits: configLimit});
        this._fileName = fileName;
    }

    uploadFileRequestMiddleware = (req, res, next) => {
        const fileToUpload = this._fileInformation.single(this._fileName);
        fileToUpload(req, res, function (err) {
            if (err) {
                res.statusCode = 400;
                return res.json({
                    errors: ['Too large file']
                });
            }
            return next();
        })
    };
}

export default File
