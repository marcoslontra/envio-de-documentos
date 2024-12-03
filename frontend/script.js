function handleFormSubmission(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const personalInfo = {
        NomeCompleto: formData.get('nomeCompleto'),
        Telefone: formData.get('telefone'),
        DataNascimento: formData.get('dataNascimento'),
        PossuiFilhos: formData.get('possuiFilhos'),
        RendaCasal: formData.get('rendaCasal'),
        PossuiImovel: formData.get('possuiImovel'),
        TresAnosTrabalho: formData.get('tresAnosTrabalho'),
    };

    const personalInfoTxt = Object.entries(personalInfo)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    const personalInfoBlob = new Blob([personalInfoTxt], { type: 'text/plain' });
    const personalInfoFile = new File([personalInfoBlob], 'informacoes_pessoais.txt', {
        type: 'text/plain',
    });

    const client = filestack.init('ApgANrOfTOWJBXY2mERX1z');

    const uploadToFilestack = async (files) => {
        try {
            const results = await Promise.all(
                files.map(file => client.upload(file))
            );
            return results.map(result => result.url);
        } catch (error) {
            throw new Error(`Erro ao fazer upload para o Filestack: ${error.message}`);
        }
    };

    const documentFiles = [
        formData.get('rgCpf'),
        formData.get('certidao'),
        formData.get('holerite'),
        formData.get('ir'),
        formData.get('faturaCartao'),
        formData.get('endereco'),
        formData.get('ctps'),
        formData.get('extratoFGTS'),
        formData.get('certidaoDependentes'),
        formData.get('cancelamento'),
        formData.get('autorizacao'),
    ].filter(file => file);

    documentFiles.push(personalInfoFile);

    document.getElementById('result').innerHTML = "<p>Enviando documentos...</p>";

    uploadToFilestack(documentFiles)
        .then((fileUrls) => {
            const uploadData = {
                files: fileUrls,
                personalInfo: personalInfoTxt,
            };

            return fetch('https://envio-de-documentos-1.onrender.com/upload', {
                method: 'POST',
                body: JSON.stringify(uploadData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
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
