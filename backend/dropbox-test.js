const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');  // Para garantir que fetch esteja disponível
require('dotenv').config();  // Para carregar o token de acesso do arquivo .env

// Inicializando o cliente Dropbox com o token de acesso
const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch: fetch
});

// Verifica a conexão com o Dropbox
dbx.filesListFolder({ path: '' })
    .then(response => {
        console.log('Conexão com Dropbox bem-sucedida:', response);
    })
    .catch(error => {
        console.error('Erro ao conectar com Dropbox:', error);
    });
