const express = require('express');

const fs = require('fs').promises;

const path = require('path');

const talkerPath = path.resolve(__dirname, './talker.json');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
// não remova esse endpoint, e para o avaliador funcionar

const readFileTalker = async () => {
  try {
    const data = await fs.readFile(talkerPath);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Arquivo não encontrado: ${error}`);
  }
};

app.get('/talker', async (req, res) => {
  const talker = await readFileTalker();
  if (talker.length === 0) {
    res.status(200).json([]);
  }
  res.status(200).json(talker);
});