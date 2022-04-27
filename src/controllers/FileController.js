const multer = require('multer');
const Files = require('../models/file_schema');

const cloudinary = require('../services/cloudinary')

const fs = require('fs');

const currentTime = Date.now();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public')
    },
    filename: (req, file, cb) => {
        cb(null, currentTime + '-' + file.originalname)
    }
});

const storageImg = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/')
    },
    filename: (req, file, cb) => {
        cb(null, currentTime + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb({message: 'Unsupported file format'}, false)
    }
}



exports.upload = async (req,res) => {
    //need to change user_id ต้องเอามาจาก device id + username/email จากใน db
    const user_id = req.userId
    const upload = multer({storage: storage}).array('file')
    upload( req, res, async (err) => {
        if (err) {
            return res.status(500).json(err)
        }
        const file_arr = []
        for(let i = 0 ; i < req.files.length ; i++){
            const file_data = {
                file_name: req.files[i].originalname,
                filename_extension: req.files[i].mimetype,
                file_path: req.files[i].path,
                file_author_id: user_id,
            }
            file_arr.push(file_data)
        }

        const data = await Files.create(file_arr)
        const data_id = data.map(key => {
            return key._id
        });

        const data_name = data.map(key => {
            return key.file_name
        });

        const file_schema = [{
            id: data_id,
            file_name: data_name
        }]
        return res.status(200).json({result: 'OK', message: 'success upload file', data: file_schema})
    });
};

exports.uploadImage = async (req,res) => {
    const user_id = req.userId
    // const user_id = 'doFavorAdminId'
    const uploadImg = multer({storage: storageImg}).array('file');

    uploadImg( req, res, async (err) => {
        if (err) {
            return res.status(500).json(err)
        }

        const file_arr = []
        for(let i = 0 ; i < req.files.length ; i++){
            const file_data = {
                file_name: req.files[i].originalname,
                filename_extension: req.files[i].mimetype,
                file_path: req.files[i].path,
                file_author_id: user_id,
            }
            file_arr.push(file_data)
        }

        const data = await Files.create(file_arr)
        const data_id = data.map(key => {
            return key._id
        });

        return res.status(200).json({result: 'OK', message: 'success upload image', data: data_id})
    });
};

exports.download = async (req,res) => {
    // const user_id = req.userId;
    const file_id = req.params.file_id;
    if(!file_id) return res.status(400).json({result: 'Bad request', message: ''});

    try {
        const data = await Files.findById(file_id);
        if(!data) return res.status(404).json({result: 'Not found', message: ''});
        //can verify user_id with author_id
        
        res.download(`${data.file_path}` , data.file_name);
    } catch(e) {
        res.status(500).json({result: 'Internal Server Error', message: ''});
    }
};


exports.uploadChatImage = async (req,res) => {
    const user_id = req.userId

    const upload = multer({
        storage: storageImg,
        limits: {fileSize: 1024 * 1024 },
        fileFilter: fileFilter
    }).array('file');
    
    try {

        upload( req, res, async (err) => {
            if (err) {
                return res.status(500).json({result: 'Internal Server Error', message: `${err.message}`, data: {}});
            }

            const uploader = async (path) => await cloudinary.uploads(path, 'Images')
            const urls = []
            const files = req.files;
            for (const file of files) {
                const { path } = file;
                const newPath = await uploader(path)
                urls.push(newPath.url)
                fs.unlinkSync(path)
            }
            return res.status(200).json({result: 'OK', message: 'success upload conversation image', data: {url : urls}})
        });
        
    } catch {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}