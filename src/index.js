// Importação de módulos
const express = require('express'); // Importa o framework Express
const fs = require('fs').promises; // Fornece operações de arquivo assíncronas
const path = require('path'); // Fornece utilitários para lidar com caminhos de arquivo
const generateToken = require('./utils/generateToken'); // Importa função para gerar token
const validateToken = require('./middlewares/validateToken'); // Middleware para validar token
// Importa middlewares para validar campos de login e palestrantes
const {
  validateEmail,
  validatePassword,
} = require('./middlewares/validateLogin');
// Importa middlewares para validar campos de palestrantes
const {
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
} = require('./middlewares/validateTalker');
// Importa middlewares para validar parâmetros de busca
const {
  validateRateParam,
  validateDateParam,
} = require('./middlewares/validateSearch');
// Importa middleware para validar patch (atualização parcial)
const validateRatePatch = require('./middlewares/validatePatch');
const talkerDB = require('./db/talkerDB'); // Importa módulo para interagir com o banco de dados

const app = express(); // Cria uma instância do aplicativo Express
app.use(express.json()); // Middleware para lidar com dados no formato JSON

const HTTP_OK_STATUS = 200; // Define o código de status HTTP 200
const PORT = process.env.PORT || '3001'; // Define a porta do servidor
const talkerPath = path.resolve(__dirname, './talker.json'); // Define o caminho do arquivo de palestrantes

// Função para ler dados de palestrantes do arquivo JSON
const readTalker = async () => {
  try {
    const data = await fs.readFile(talkerPath); // Lê os dados do arquivo
    return JSON.parse(data); // Retorna os dados parseados como JSON
  } catch (error) {
    console.error(`Error ao ler o arquivo: ${error.message}`); // Exibe erro, caso ocorra
  }
};

// Rota para obter todos os palestrantes
app.get('/talker', async (_req, res) => {
  try {
    const talkers = await readTalker(); // Lê os palestrantes
    // Retorna os palestrantes ou um array vazio, dependendo se existem dados
    return talkers ? res.status(200).json(talkers) : res.status(200).json([]);
  } catch (error) {
    res.status(500).send(error.message); // Envia mensagem de erro se houver um problema
  }
});

// Rota para obter palestrantes do banco de dados
app.get('/talker/db', async (_req, res) => {
  try {
    const [result] = await talkerDB.findAll(); // Obtém palestrantes do banco de dados
    // Formata os dados dos palestrantes e os retorna
    const fixedFormat = result.map((talker) => {
      const { name, age, id, talk_rate: rate, talk_watched_at: watchedAt } = talker; // Extrai informações específicas do palestrante
      const talkInfo = {
        watchedAt,
        rate,
      };
      return { name, age, id, talk: talkInfo }; // Retorna o palestrante formatado
    });
    res.status(200).json(fixedFormat); // Envia a resposta com os dados formatados
  } catch (error) {
    res.status(500).send(error.message); // Envia mensagem de erro se houver um problema
  }
});

// Rota para buscar palestrantes com filtros
app.get(
  '/talker/search',
  validateToken, // Middleware para validar o token
  validateRateParam, // Middleware para validar o parâmetro de taxa (rate)
  validateDateParam, // Middleware para validar o parâmetro de data (watchedAt)
  async (req, res) => {
    try {
      const { rate, q, date } = req.query; // Obtém parâmetros da consulta
      const talkers = await readTalker(); // Lê os palestrantes

      let filteredTalkers = talkers; // Define uma variável para os palestrantes filtrados

      // Filtra os palestrantes com base nos parâmetros da consulta
      if (q) filteredTalkers = filteredTalkers.filter((talker) => talker.name.includes(q));
      if (rate) { 
        filteredTalkers = filteredTalkers.filter((talker) => talker.talk.rate === Number(rate));
      }
      if (date) {
        filteredTalkers = filteredTalkers.filter((talker) => talker.talk.watchedAt === date);
      }

      return res.status(200).json(filteredTalkers); // Retorna os palestrantes filtrados
    } catch (err) {
      res.status(500).send({ message: err.message }); // Envia mensagem de erro se houver um problema
    }
  },
);

// Não remova esse endpoint, é para o avaliador funcionar

// ... Continuação do código das demais rotas

// Rota raiz para manter o avaliador funcionando
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send(); // Responde com status HTTP OK
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log('Online'); // Exibe mensagem indicando que o servidor está online
});
