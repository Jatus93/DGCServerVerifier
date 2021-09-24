import GreenApi from './green';
import { Router, Express } from 'express';

export const setupApis = (application: Express):void => {
  const router = Router();
  const exampleApi = new GreenApi(router);

  exampleApi.setupApi(); 
  application.use('/api', router);
  console.log('inited');
};

export interface API {
  setupApi(): void; //virtual method
}
