import { setupApis } from './api';
import express from 'express';
import cors from 'cors';

const app = express();

app.set('port', process.env.PORT || 5050);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupApis(app);

export default app;