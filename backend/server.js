const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');  // Para processar dados de texto

const app = express();
const port = 3000;

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

// Verifica se o diretório "uploads" existe, senão cria
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do armazenamento dos arquivos com multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Define onde os arquivos serão armazenados
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Define o nome do arquivo
    }
});

// Inicializando o multer com a configuração de armazenamento
const upload = multer({ storage: storage });

// Rota para o upload dos documentos
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
]), (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('Nenhum arquivo foi enviado!');
        }

        // Recebe o nome do usuário preenchido no formulário
        const nomeCompleto = req.body.nomeCompleto.trim().replace(/\s+/g, '_');  // Normaliza o nome para uma pasta válida

        // Cria o diretório com o nome do usuário, se não existir
        const userDir = path.join(uploadDir, nomeCompleto);
        
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });  // Usando { recursive: true } para criar diretórios intermediários
        }

        // Mover os arquivos para a pasta do usuário
        Object.keys(req.files).forEach(fileField => {
            req.files[fileField].forEach(file => {
                const filePath = path.join(userDir, file.filename);
                fs.renameSync(file.path, filePath);  // Mover o arquivo para o diretório do usuário
            });
        });

        // Criando o arquivo de texto com as informações pessoais
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
        const personalDataFilePath = path.join(userDir, `informacoes_pessoais_${Date.now()}.txt`);

        // Criando o arquivo de texto com as informações pessoais
        fs.writeFileSync(personalDataFilePath, personalDataText);

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
