// Função para lidar com o envio do formulário
function handleFormSubmission(event) {
    event.preventDefault(); // Evita o comportamento padrão de envio do formulário

    const formData = new FormData(event.target);

    // Exibe um indicador de carregamento
    document.getElementById('result').innerHTML = "<p>Enviando documentos...</p>";

    // Coleta as URLs dos arquivos carregados pelo Filestack
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        const fileUrl = input.value; // O URL do arquivo carregado no Filestack
        if (fileUrl) {
            // Adiciona a URL do arquivo ao FormData
            formData.append(input.name, fileUrl);
        }
    });

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

// Função para abrir o File Picker do Filestack
function openFilePicker(event) {
    const client = filestack.init('ApgANrOfTOWJBXY2mERX1z');

    // Abre o File Picker do Filestack
    client.picker({
        fromSources: ['local_file_system', 'url', 'imagesearch', 'googledrive', 'dropbox'],
        onUploadDone: function(res) {
            const fieldName = event.target.id;
            const fileUrl = res.filesUploaded[0].url; // URL do arquivo carregado

            // Atualiza o campo de input com a URL do arquivo
            document.getElementById(fieldName).value = fileUrl;
        }
    }).open();
}

// Adiciona ouvintes de eventos para os botões de upload
document.getElementById('rgCpf').addEventListener('click', openFilePicker);
document.getElementById('certidao').addEventListener('click', openFilePicker);
document.getElementById('holerite').addEventListener('click', openFilePicker);
document.getElementById('ir').addEventListener('click', openFilePicker);
document.getElementById('faturaCartao').addEventListener('click', openFilePicker);
document.getElementById('endereco').addEventListener('click', openFilePicker);
document.getElementById('ctps').addEventListener('click', openFilePicker);
document.getElementById('extratoFGTS').addEventListener('click', openFilePicker);
document.getElementById('certidaoDependentes').addEventListener('click', openFilePicker);
document.getElementById('cancelamento').addEventListener('click', openFilePicker);
document.getElementById('autorizacao').addEventListener('click', openFilePicker);

// Adiciona o ouvinte de evento para o envio do formulário
document.getElementById('uploadForm').addEventListener('submit', handleFormSubmission);
