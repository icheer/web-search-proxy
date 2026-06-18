import 'dotenv/config';
import express from 'express';
import { searchHandler } from './search.js';
import { fetchHandler } from './fetch.js';
import { logsHandler } from './logs.js';

const app = express();
app.use(express.json());
app.post('/search', searchHandler);
app.post('/fetch', fetchHandler);
app.get('/logs', logsHandler);

const port = process.env.PORT ?? 3030;
app.listen(port, () => console.log(`listening on :${port}`));
