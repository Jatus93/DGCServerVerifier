import { setupApis } from './api';
import express from 'express';

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded());
setupApis(app);

export default app;