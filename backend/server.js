require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { uploadFile } = require('@uploadcare/upload-client');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));

app.use(bodyParser.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

async function uploadToUploadcare(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);

        const result = await uploadFile(fileData, {
            publicKey: 'a175e2b2ae361b86b5e7',
            store: 'auto',
            metadata: {
                subsystem: 'js-client',
                pet: 'cat'
            }
        });

        return result.uuid;
    } catch (error) {
        throw error;
    }
}

app.post('/upload', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Nenhum arquivo foi enviado!');
        }

        for (const file of req.files) {
            const filePath = path.join(uploadDir, file.filename);
            const fileUuid = await uploadToUploadcare(filePath);
        }

        res.status(200).send('Arquivos enviados com sucesso para o Uploadcare!');
    } catch (err) {
        res.status(500).send('Erro no servidor. Tente novamente mais tarde.');
    }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
