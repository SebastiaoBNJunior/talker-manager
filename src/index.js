const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const generateToken = require('./utils/generateToken');
const validateToken = require('./middlewares/validateToken');
const {
  validateEmail,
  validatePassword,
} = require('./middlewares/validateLogin');
const {
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
} = require('./middlewares/validateTalker');
const {
  validateRateParam,
  validateDateParam,
} = require('./middlewares/validateSearch');
const validateRatePatch = require('./middlewares/validatePatch');
const talkerDB = require('./db/talkerDB');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
const talkerPath = path.resolve(__dirname, './talker.json');

const readTalker = async () => {
  try {
    const data = await fs.readFile(talkerPath);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error ao ler o arquivo: ${error.message}`);
  }
};

app.get('/talker', async (_req, res) => {
  try {
    const talkers = await readTalker();
    return talkers ? res.status(200).json(talkers) : res.status(200).json([]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/talker/db',
  async (_req, res) => {
    try {
      const [result] = await talkerDB.findAll();
      const fixedFormat = result.map((talker) => {
        const { name, age, id, talk_rate: rate, talk_watched_at: watchedAt } = talker;
        const talkInfo = {
          watchedAt,
          rate,
        };
        return { name, age, id, talk: talkInfo };
      });
      res.status(200).json(fixedFormat);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

app.get(
  '/talker/search',
  validateToken,
  validateRateParam,
  validateDateParam,
  async (req, res) => {
    try {
      const { rate, q, date } = req.query;
      const talkers = await readTalker();
      let filteredTalkers = talkers;
      if (q) filteredTalkers = filteredTalkers.filter((talker) => talker.name.includes(q));
      if (rate) { 
        filteredTalkers = filteredTalkers.filter((talker) => talker.talk.rate === Number(rate));
      }
      if (date) {
        filteredTalkers = filteredTalkers.filter((talker) => talker.talk.watchedAt === date);
      }
      return res.status(200).json(filteredTalkers);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },
);

app.get('/talker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const talkers = await readTalker();
    const filteredTalker = talkers.filter((talker) => talker.id === Number(id));
    return filteredTalker.length === 0
      ? res.status(404).send({ message: 'Pessoa palestrante não encontrada' })
      : res.status(200).json(filteredTalker[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/login', validateEmail, validatePassword, (_req, res) => {
  try {
    const token = generateToken();
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post(
  '/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
    const talker = { ...req.body };
    const talkers = await readTalker();
    const id = talkers[talkers.length - 1].id + 1;

    await fs.writeFile(
      talkerPath,
      JSON.stringify([...talkers, { id, ...talker }]),
    );
    res.status(201).json({ id, ...talker });
  },
);

app.put(
  '/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTalker = { ...req.body };
      const talkers = await readTalker();
      const index = talkers.findIndex((talker) => talker.id === Number(id));
      if (index === -1) {
        return res
          .status(404)
          .json({ message: 'Pessoa palestrante não encontrada' });
      }
      talkers[index] = { id: Number(id), ...updatedTalker };
      await fs.writeFile(talkerPath, JSON.stringify(talkers));
      res.status(200).json({ id: Number(id), ...updatedTalker });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
);

app.delete('/talker/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const talkers = await readTalker();
    const filteredTalkers = talkers.filter((talker) => talker.id !== Number(id));
    await fs.writeFile(talkerPath, JSON.stringify(filteredTalkers));
    res.status(204).end();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.patch(
  '/talker/rate/:id',
  validateToken,
  validateRatePatch,
  async (req, res) => {
    try {
      const { id } = req.params;
      const rate = req.body;
      const talkers = await readTalker();
      const index = talkers.findIndex((talker) => talker.id === Number(id));
      talkers[index].talk.rate = rate.rate;
      await fs.writeFile(talkerPath, JSON.stringify(talkers));
      res.status(204).json(talkers);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
);

// não remova esse endpoint, é para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
