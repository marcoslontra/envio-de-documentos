// Forçando a reconstrução no Render
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
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

// Carrega as credenciais da conta de serviço
const keyPath = path.join(__dirname, 'config/service-account-key.json');

// Depuração: imprime o caminho do arquivo de chave
console.log(`Caminho para a chave de serviço: ${keyPath}`);  // Aqui você verá o caminho no log

// Agora, carrega o arquivo de chave
const credentials = require(keyPath);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

// Função para fazer o upload de um arquivo para o Google Drive
async function uploadToDrive(filePath, folderId) {
    const fileMetadata = {
        name: path.basename(filePath),
        parents: [folderId] // Substitua pelo ID da pasta "Documentos de Usuários"
    };
    const media = {
        mimeType: 'application/pdf', // Ajuste conforme necessário
        body: fs.createReadStream(filePath)
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        console.log(`Arquivo enviado: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error('Erro ao enviar arquivo para o Google Drive:', error);
        throw error;
    }
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

        // Recebe o nome do usuário e cria a pasta no Google Drive
        const nomeCompleto = req.body.nomeCompleto.trim().replace(/\s+/g, '_');
        const folderMetadata = {
            name: nomeCompleto,
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['1jLKVW9f5dmwW0O0jUg3sNqvAhP_WL80U'] // ID da pasta "Documentos de Usuários"
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });

        const folderId = folder.data.id;

        // Faz o upload dos arquivos para a nova pasta
        const files = req.files;
        for (const fileField in files) {
            for (const file of files[fileField]) {
                const filePath = path.join(uploadDir, file.filename);
                await uploadToDrive(filePath, folderId);
            }
        }

        // Cria o arquivo de texto com as informações pessoais no Google Drive
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
        const textFileMetadata = {
            name: `informacoes_pessoais_${Date.now()}.txt`,
            parents: [folderId]
        };
        const textMedia = {
            mimeType: 'text/plain',
            body: personalDataText
        };

        await drive.files.create({
            resource: textFileMetadata,
            media: textMedia,
            fields: 'id'
        });

        res.status(200).send('Arquivos e informações pessoais enviados com sucesso!');
    } catch (err) {
        console.error('Erro ao processar o upload:', err);
        res.status(500).send('Erro no servidor. Tente novamente mais tarde.');
    }
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
