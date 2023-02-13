const multer = require('multer');
const fs = require('fs');

const uploader = (directory, filePrefix) => {
    // Define default directory storage
    let defaultDir = './src/public';

    // Multer Configuration
    // 1. Config storage location
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const storeDir = directory ? defaultDir + directory : defaultDir;
            console.log(storeDir);
            if (fs.existsSync(storeDir)) {
                console.log(`Directory ${storeDir} exist ✅`);
                cb(null, storeDir);
            } else {
                fs.mkdir(storeDir, { recursive: true }, (error) => {
                    if (error) {
                        console.log('Error create directory :', error);
                    }
                    cb(error, storeDir);
                });
            }
        },
        filename: (req, file, cb) => {
            console.log('Cek original name :', file.originalname);
            let ext = file.originalname.split('.')[file.originalname.split('.').length - 1];
            console.log("check extention :", ext);

            let newName = filePrefix + Date.now() + '.' + ext;
            console.log("New name :", newName);
            cb(null, newName);
        }
    });

    // 2. Config file filter 
    const fileFilter = (req, file, cb) => {
        const extFilter = /\.(jpg|jpeg|png|webp)/;
        let checkExt = file.originalname.toLowerCase().match(extFilter);

        if (checkExt) {
            cb(null, true);
        } else {
            cb(new Error("Your file ext denied"), false);
        }
    };

    // 3. Mereturn multer

    return multer({ storage, fileFilter });
}

module.exports = uploader;