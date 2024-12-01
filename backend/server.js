require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { uploadFile } = require('@uploadcare/upload-client');  // Importando o método uploadFile

// Configuração do servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Permitir qualquer origem durante o desenvolvimento
app.use(cors({
    origin: '*',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));

// Configuração do body-parser para processar dados de formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do multer para upload de arquivos
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do armazenamento com multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Arquivos temporários armazenados localmente
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Função para fazer o upload de um arquivo para o Uploadcare usando o novo cliente API
async function uploadToUploadcare(filePath) {
    try {
        // Lê o arquivo como Buffer ou File (necessário para o upload)
        const fileData = fs.readFileSync(filePath);  // Lê o arquivo local como Buffer

        // Faz o upload do arquivo para o Uploadcare
        const result = await uploadFile(fileData, {
            publicKey: 'a175e2b2ae361b86b5e7',  // Sua chave pública
            store: 'auto',  // Usar o armazenamento automático
            metadata: {
                subsystem: 'js-client',
                pet: 'cat'
            }
        });

        console.log('Arquivo enviado com sucesso para o Uploadcare:', result);
        return result.uuid;  // Retorna o UUID do arquivo
    } catch (error) {
        console.error('Erro ao enviar arquivo para o Uploadcare:', error);
        throw error;
    }
}

// Rota para upload de documentos
app.post('/upload', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Nenhum arquivo foi enviado!');
        }

        // Faz o upload de cada arquivo para o Uploadcare
        for (const file of req.files) {
            const filePath = path.join(uploadDir, file.filename);
            console.log(`Enviando o arquivo: ${file.filename} para o Uploadcare`);
            const fileUuid = await uploadToUploadcare(filePath);  // Chama a função para enviar o arquivo
            console.log('UUID do arquivo:', fileUuid);  // Exibe o UUID retornado
        }

        res.status(200).send('Arquivos enviados com sucesso para o Uploadcare!');
    } catch (err) {
        console.error('Erro ao processar o upload:', err);
        res.status(500).send('Erro no servidor. Tente novamente mais tarde.');
    }
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
