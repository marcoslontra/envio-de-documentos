// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Forçando a reconstrução no Render
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Dropbox } = require('dropbox');
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

// Configuração do Dropbox (usando token de acesso de curto prazo)
const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN, // Certifique-se de definir o token no arquivo .env
    fetch: require('isomorphic-fetch') // Para garantir que a função fetch esteja disponível
});

// Função para fazer o upload de um arquivo para o Dropbox
async function uploadToDropbox(filePath, dropboxPath) {
    const fileStream = fs.createReadStream(filePath);

    try {
        const response = await dbx.filesUpload({
            path: dropboxPath,
            contents: fileStream
        });
        console.log(`Arquivo enviado: ${response.result.id}`);
        return response.result.id;
    } catch (error) {
        console.error('Erro ao enviar arquivo para o Dropbox:', error);
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

        // Recebe o nome do usuário e cria uma pasta no Dropbox
        const nomeCompleto = req.body.nomeCompleto.trim().replace(/\s+/g, '_');
        const dropboxFolderPath = `/Documentos de Usuários/${nomeCompleto}`;

        // Criação de uma nova pasta no Dropbox (se não existir)
        await dbx.filesCreateFolderV2({ path: dropboxFolderPath });

        // Faz o upload dos arquivos para a nova pasta
        const files = req.files;
        for (const fileField in files) {
            for (const file of files[fileField]) {
                const filePath = path.join(uploadDir, file.filename);
                const dropboxFilePath = `${dropboxFolderPath}/${file.filename}`;
                await uploadToDropbox(filePath, dropboxFilePath);
            }
        }

        // Cria o arquivo de texto com as informações pessoais no Dropbox
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
        const textFilePath = `${dropboxFolderPath}/informacoes_pessoais_${Date.now()}.txt`;

        await dbx.filesUpload({
            path: textFilePath,
            contents: personalDataText
        });

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
