const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// require('dotenv').config();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const AWS = require('aws-sdk');
const ID = process.env.ID;
const SECRET = process.env.SECRET;
const BUCKET_NAME = 'kibwa-18';
const MYREGION = 'ap-northeast-2';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: MYREGION,
});

var storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploadedFiles/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}__${file.originalname}`);
    },
});

var upload = multer({ dest: 'uploadedFiles/' });
var uploadWithOriginalFilename = multer({ storage: storage });

router.get('/', function (req, res) {
    res.render('upload');
});

router.get('/list', (req, res) => {
    var params = {
        Bucket: BUCKET_NAME,
        Delimiter: '/',
        Prefix: 'uploadedFiles/',
    };
    s3.listObjects(params, function (err, data) {
        if (err) throw err;
        const files = data.Contents.map(file => ({
            Key: file.Key,
            LastModified: file.LastModified,
            Size: file.Size,
            StorageClass: file.StorageClass
        }));
        res.json(files);
    });
});

router.post(
    '/uploadFile',
    uploadWithOriginalFilename.single('attachment'),
    function (req, res) {
        const filename = req.file.filename;
        const file = 'uploadedFiles/' + filename;
        const uploadFile = filename => {
            const fileContent = fs.readFileSync(filename);
            const params = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: fileContent,
            };
            s3.upload(params, function (err, data) {
                if (err) {
                    return console.log(err);
                }
                console.log(`File uploaded successfully. ${data.Location}`);
            });
        };
        uploadFile(file);

        const filePath = path.join(__dirname, '../uploadedFiles', filename);
        fs.unlink(filePath, err =>
            err
                ? console.log(err)
                : console.log(`File delete successfully. ${filePath}`),
        );
        res.redirect('/');
    },
);

router.post('/downloadFile', function (req, res) {
    var filename = req.body.dlKey;
    const downloadFile = filename => {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filename,
        };
        s3.getObject(params, function (err, data) {
            if (err) {
                return console.log(err);
            }
            res.attachment(filename);
            res.send(data.Body);
        });
    };
    downloadFile(filename);
});

router.post('/deleteFile', function (req, res) {
    var filename = req.body.dlKey;
    const deleteFile = filename => {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filename,
        };
        s3.deleteObject(params, function (err, data) {
            if (err) {
                return console.log(err);
            }
            res.json({ message: 'File deleted successfully' });
        });
    };
    deleteFile(filename);
});

router.post('/processVideo', async function (req, res) {
    var filename = req.body.dlKey;
    try {
        const response = await axios.get('http://localhost:3500/process_video', {
            params: {
                video_key: filename
            }
        });
        res.redirect('/');
    } catch (error) {
        console.log('Error processing video:', error);
        res.status(500).send('Error processing video');
    }
});

router.get('/view_frames', (req, res) => {
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: 'Department/'
    };
    s3.listObjectsV2(params, function (err, data) {
        if (err) {
            return res.status(500).json({ message: 'Unable to fetch images: ' + err });
        }
        const frames = data.Contents.map(file => ({
            filename: file.Key,
            url: s3.getSignedUrl('getObject', { Bucket: BUCKET_NAME, Key: file.Key })
        }));
        res.json(frames);
    });
});

router.get('/view_image', (req, res) => {
    const filename = req.query.filename;
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename
    };
    s3.getObject(params, function (err, data) {
        if (err) {
            return res.status(500).json({ message: 'Unable to fetch image: ' + err });
        }
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
    });
});

module.exports = router;
