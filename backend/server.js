// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Forçando a reconstrução
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mega = require('megajs');
const bodyParser = require('body-parser');

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

// Configuração do Mega.nz (autenticação com e-mail e senha)
const storageMega = mega({
    email: 'marcoslontra19@gmail.com',
    password: 'marcos9692'
});

// Função para fazer o upload de um arquivo para o Mega.nz
async function uploadToMega(filePath, remoteFileName) {
    const uploadStream = storageMega.upload({
        name: remoteFileName  // Nome do arquivo no Mega
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
        uploadStream.on('complete', () => {
            console.log(`Upload completo para o Mega: ${remoteFileName}`);
            resolve();
        });

        uploadStream.on('error', (err) => {
            console.error('Erro ao enviar arquivo para o Mega:', err);
            reject(err);
        });
    });
}

// Rota para upload de documentos
app.post('/upload', upload.fields([
    { name: 'rgCpf' },
    { name: 'certidao' },
    { name: 'holerite' },
    { name: 'ir' },
    { name: 'faturaCartao' },
    { name: 'endereco' },
    { name: 'ctps' },
    { name: 'extratoFGTS' },
    { name: 'certidaoDependentes' },
    { name: 'cancelamento' },
    { name: 'autorizacao' }
]), async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('Nenhum arquivo foi enviado!');
        }

        // Recebe o nome do usuário e cria uma pasta no Mega
        const nomeCompleto = req.body.nomeCompleto.trim().replace(/\s+/g, '_');
        const megaFolderPath = `/${nomeCompleto}`;

        // Faz o upload dos arquivos para o Mega
        const files = req.files;
        for (const fileField in files) {
            for (const file of files[fileField]) {
                const filePath = path.join(uploadDir, file.filename);
                const remoteFileName = `${megaFolderPath}/${file.filename}`;
                console.log(`Enviando o arquivo: ${file.filename} para o Mega`);
                await uploadToMega(filePath, remoteFileName);
            }
        }

        // Cria o arquivo de texto com as informações pessoais
        const personalData = {
            nomeCompleto: req.body.nomeCompleto,
            pis: req.body.pis,
            email: req.body.email,
            telefone: req.body.telefone,
            escolaridade: req.body.escolaridade,
            tempoResidencia: req.body.tempoResidencia,
            profissao: req.body.profissao,
            tempoEmprego: req.body.tempoEmprego
        };

        const personalDataText = JSON.stringify(personalData, null, 2);
        const textFilePath = path.join(uploadDir, `informacoes_pessoais_${Date.now()}.txt`);

        // Salva o arquivo de texto localmente
        fs.writeFileSync(textFilePath, personalDataText);

        // Faz o upload do arquivo de texto para o Mega
        await uploadToMega(textFilePath, `${megaFolderPath}/informacoes_pessoais_${Date.now()}.txt`);

        res.status(200).send('Arquivos e informações pessoais enviados com sucesso!');
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
