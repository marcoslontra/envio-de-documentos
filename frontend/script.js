document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o comportamento padrão de envio do formulário (que recarregaria a página)

    const formData = new FormData(); // Cria um novo FormData para enviar os dados

    // Adiciona os arquivos selecionados ao FormData
    formData.append('rgCpf', document.getElementById('rgCpf').files[0]);
    formData.append('certidao', document.getElementById('certidao').files[0]);
    formData.append('holerite', document.getElementById('holerite').files[0]);
    formData.append('ir', document.getElementById('ir').files[0]);
    formData.append('faturaCartao', document.getElementById('faturaCartao').files[0]);
    formData.append('endereco', document.getElementById('endereco').files[0]);
    formData.append('ctps', document.getElementById('ctps').files[0]);
    formData.append('extratoFGTS', document.getElementById('extratoFGTS').files[0]);
    formData.append('certidaoDependentes', document.getElementById('certidaoDependentes').files[0]);
    formData.append('cancelamento', document.getElementById('cancelamento').files[0]);
    formData.append('autorizacao', document.getElementById('autorizacao').files[0]);

    // Adiciona os campos de texto ao FormData
    formData.append('nomeCompleto', document.getElementById('nomeCompleto').value);
    formData.append('pis', document.getElementById('pis').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('telefone', document.getElementById('telefone').value);
    formData.append('escolaridade', document.getElementById('escolaridade').value);
    formData.append('tempoResidencia', document.getElementById('tempoResidencia').value);
    formData.append('profissao', document.getElementById('profissao').value);
    formData.append('tempoEmprego', document.getElementById('tempoEmprego').value);

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
        document.getElementById('uploadForm').reset();

        setTimeout(() => {
            document.getElementById('result').innerHTML = '';
        }, 5000);
    });
});
