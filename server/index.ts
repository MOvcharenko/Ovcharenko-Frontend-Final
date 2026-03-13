import express from 'express';
import cors from 'cors';
import router from './router';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

app.use('/api', router);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, () => {
  console.log(`FlashFlow backend listening on http://localhost:${PORT}`);
});
