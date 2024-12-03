function handleFormSubmission(event) {
    event.preventDefault(); // Evita o comportamento padrão de envio do formulário

    const formData = new FormData(event.target);

    // Exibe um indicador de carregamento
    document.getElementById('result').innerHTML = "<p>Enviando documentos...</p>";

    // Envia os dados para o servidor via fetch
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
        event.target.reset();
        setTimeout(() => {
            document.getElementById('result').innerHTML = '';
        }, 5000);
    });
}

document.getElementById('uploadForm').addEventListener('submit', handleFormSubmission);
