const client = filestack.init('ApgANrOfTOWJBXY2mERX1z');

function handleFormSubmission(event) {
    event.preventDefault();

    document.getElementById('result').innerHTML = "<p>Enviando documentos...</p>";

    const files = document.querySelectorAll('.filestack-upload');
    let uploadedFiles = [];

    let filePromises = [];

    files.forEach(fileInput => {
        const file = fileInput.files[0];
        if (file) {
            filePromises.push(
                client.upload(file).then(response => {
                    uploadedFiles.push(response.url);
                }).catch(error => {
                    throw new Error(`Erro ao enviar o arquivo: ${error.message}`);
                })
            );
        }
    });

    Promise.all(filePromises)
        .then(() => {
            document.getElementById('result').innerHTML = `<p style="color: green;">Arquivos enviados com sucesso para o FileStack!</p>`;
            console.log('Arquivos enviados:', uploadedFiles);
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
        })
        .finally(() => {
            event.target.reset();
            setTimeout(() => {
                document.getElementById('result').innerHTML = '';
            }, 5000);
        });
}

document.getElementById('uploadForm').addEventListener('submit', handleFormSubmission);
