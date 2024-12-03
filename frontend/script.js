function handleFormSubmission(event) {
    event.preventDefault(); // Evita o comportamento padrão de envio do formulário

    // Exibe um indicador de carregamento
    document.getElementById('result').innerHTML = "<p>Enviando documentos...</p>";

    // Inicializa o Filestack client com a API Key
    const client = filestack.init('ApgANrOfTOWJBXY2mERX1z');
    
    // Abre o Filestack File Picker
    client.picker()
        .open()
        .then(result => {
            if (result.filesUploaded.length > 0) {
                const fileUrls = result.filesUploaded.map(file => file.url); // Extrai as URLs dos arquivos carregados

                // Envia as URLs para o servidor via fetch
                const formData = new FormData();
                fileUrls.forEach((url, index) => {
                    formData.append(`file_${index}`, url);  // Adiciona cada URL no FormData
                });

                fetch('https://envio-de-documentos-1.onrender.com/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao enviar documentos!');
                    }
                    return response.text();
                })
                .then(data => {
                    document.getElementById('result').innerHTML = `<p style="color: green;">${data}</p>`;
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
                })
                .finally(() => {
                    setTimeout(() => {
                        document.getElementById('result').innerHTML = '';
                    }, 5000);
                });
            } else {
                document.getElementById('result').innerHTML = `<p style="color: red;">Nenhum arquivo selecionado.</p>`;
            }
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `<p style="color: red;">Erro ao abrir o Filestack Picker: ${error.message}</p>`;
        });
}

document.getElementById('uploadForm').addEventListener('submit', handleFormSubmission);
