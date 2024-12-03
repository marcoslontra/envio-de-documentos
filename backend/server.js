require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios'); // Usando axios para fazer requisições HTTP para o Filestack
const FormData = require('form-data'); // Assegure-se de que o FormData esteja importado corretamente

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Filestack com a sua chave
const FILSTACK_API_KEY = 'ApgANrOfTOWJBXY2mERX1z';
const FILSTACK_UPLOAD_URL = 'https://www.filestackapi.com/api/store/S3'; // Endpoint da API do Filestack para upload

app.use(cors({
    origin: '*',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Diretório de uploads temporários
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do multer para armazenar os arquivos temporariamente
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Armazenar no diretório de uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Usar timestamp para evitar conflitos
    }
});
const upload = multer({ storage: storage });

// Função para enviar o arquivo para o Filestack usando a API REST
async function uploadToFilestack(filePath) {
    try {
        // Lê o arquivo local como um Buffer
        const fileData = fs.readFileSync(filePath);

        // Cria o FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('file', fileData, path.basename(filePath)); // Adiciona o arquivo ao formData
        formData.append('apikey', FILSTACK_API_KEY); // Adiciona a chave da API

        // Faz o upload para o Filestack usando a API REST
        const response = await axios.post(FILSTACK_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(), // Adiciona os headers necessários do FormData
            },
        });

        // Retorna a URL do arquivo enviado para o Filestack
        return response.data.url;
    } catch (error) {
        console.error('Erro ao enviar para o Filestack:', error.message);
        throw new Error('Erro ao enviar para o Filestack');
    }
}

// Rota para upload de documentos
app.post('/upload', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Nenhum arquivo foi enviado!');
        }

        const fileUrls = []; // Para armazenar as URLs dos arquivos enviados

        // Enviar cada arquivo para o Filestack
        for (const file of req.files) {
            const filePath = path.join(uploadDir, file.filename); // Caminho completo do arquivo temporário
            const fileUrl = await uploadToFilestack(filePath); // Envia para o Filestack e obtém a URL
            console.log('URL do arquivo enviado:', fileUrl); // Log da URL para depuração
            fileUrls.push(fileUrl); // Adiciona a URL à lista
        }

        // Responde com sucesso
        res.status(200).json({
            message: 'Arquivos enviados com sucesso para o Filestack!',
            fileUrls: fileUrls
        });
    } catch (err) {
        console.error('Erro ao processar o upload:', err);
        res.status(500).send('Erro no servidor. Tente novamente mais tarde.');
    }
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
