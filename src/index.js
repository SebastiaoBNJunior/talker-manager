const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(8).toString('hex');

const path = require('path');

const talkerPath = path.resolve(__dirname, './talker.json');

const { validEmail, validPassword } = require('./middlewares/validateUser');
const validateToken = require('./middlewares/validateToken');
const validateName = require('./middlewares/validateName');
const validateAge = require('./middlewares/validateAge');
const { validateTalk, validateRate } = require('./middlewares/validateTalk');

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

const readFileTalker = async () => {
  try {
    const data = await fs.readFile(talkerPath);
    return JSON.parse(data);
  } catch (error) {
    return console.error(`Arquivo não pode ser lido: ${error}`);
  }
};

app.get('/talker', async (_req, res) => {
  const talker = await readFileTalker();
  if (talker.length === 0) {
    return res.status(200).json([]);
  }
  return res.status(200).json(talker);
});

app.get('/talker/search', validateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const talkers = await readFileTalker();

    if (!q) {
      return res.status(200).json(talkers);
    }

    const findTalker = talkers.filter((talker) => talker.name
      .toLowerCase().includes(q.toLowerCase()));
    return res.status(200).json(findTalker);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/talker/:id', async (req, res) => {
  const talker = await readFileTalker();
  const person = talker.find(({ id }) => id === Number(req.params.id));
  if (!person) {
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  return res.status(200).json(person);
});

app.post('/login', validEmail, validPassword, (req, res) => {
  const { email, password } = req.body;
  if ([email, password].includes(undefined)) {
    return res.status(401).json({ message: 'Campos ausentes' });
  }
  const token = generateToken();
  return res.status(200).json({ token });
});

app.post('/talker',
  validateToken, 
  validateAge, 
  validateTalk, 
  validateRate, 
  validateName, async (req, res) => {
    try {
      const talker = req.body;
      const talkers = await readFileTalker();
      talker.id = talkers.length + 1;
      const allTalkers = JSON.stringify([...talkers, talker]);
      await fs.writeFile(talkerPath, allTalkers);
      return res.status(201).json(talker);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

app.put('/talker/:id',
  validateToken, 
  validateAge, 
  validateTalk, 
  validateRate, 
  validateName,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, age, talk } = req.body;
      const talkers = await readFileTalker();
      const talkerIndex = talkers.findIndex((talker) => talker.id === Number(id));
      if (!talkers[talkerIndex]) {
        return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
      } 
      talkers[talkerIndex] = { id: Number(id), name, age, talk };
      const updatedTalker = JSON.stringify(talkers);
      await fs.writeFile(talkerPath, updatedTalker);
      return res.status(200).json(talkers[talkerIndex]);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

app.delete('/talker/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const talkers = await readFileTalker();
    const filteredTalkers = talkers.find((talker) => talker.id === Number(id));
    const updatedTalkers = JSON.stringify(filteredTalkers, null, 2);
    await fs.writeFile(talkerPath, updatedTalkers);
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
