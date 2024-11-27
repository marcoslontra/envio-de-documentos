<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de Documentos</title>
</head>
<body>
    <h1>Formulário de Envio de Documentos</h1>
    <form id="uploadForm">
        <label for="nomeCompleto">Nome Completo:</label>
        <input type="text" id="nomeCompleto" name="nomeCompleto" required><br>

        <label for="pis">PIS:</label>
        <input type="text" id="pis" name="pis" required><br>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br>

        <label for="telefone">Telefone:</label>
        <input type="tel" id="telefone" name="telefone" required><br>

        <label for="escolaridade">Escolaridade:</label>
        <input type="text" id="escolaridade" name="escolaridade" required><br>

        <label for="tempoResidencia">Tempo de Residência:</label>
        <input type="text" id="tempoResidencia" name="tempoResidencia" required><br>

        <label for="profissao">Profissão:</label>
        <input type="text" id="profissao" name="profissao" required><br>

        <label for="tempoEmprego">Tempo de Emprego:</label>
        <input type="text" id="tempoEmprego" name="tempoEmprego" required><br>

        <label for="rgCpf">RG/CPF:</label>
        <input type="file" id="rgCpf" name="rgCpf" required><br>

        <label for="certidao">Certidão:</label>
        <input type="file" id="certidao" name="certidao" required><br>

        <label for="holerite">Holerite:</label>
        <input type="file" id="holerite" name="holerite" required><br>

        <label for="ir">IR:</label>
        <input type="file" id="ir" name="ir" required><br>

        <label for="faturaCartao">Fatura do Cartão:</label>
        <input type="file" id="faturaCartao" name="faturaCartao" required><br>

        <label for="endereco">Comprovante de Endereço:</label>
        <input type="file" id="endereco" name="endereco" required><br>

        <label for="ctps">CTPS:</label>
        <input type="file" id="ctps" name="ctps" required><br>

        <label for="extratoFGTS">Extrato FGTS:</label>
        <input type="file" id="extratoFGTS" name="extratoFGTS" required><br>

        <label for="certidaoDependentes">Certidão de Dependentes:</label>
        <input type="file" id="certidaoDependentes" name="certidaoDependentes" required><br>

        <label for="cancelamento">Cancelamento:</label>
        <input type="file" id="cancelamento" name="cancelamento" required><br>

        <label for="autorizacao">Autorização:</label>
        <input type="file" id="autorizacao" name="autorizacao" required><br>

        <button type="submit">Enviar Documentos</button>
    </form>

    <div id="result"></div>

    <script>
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
    </script>
</body>
</html>
