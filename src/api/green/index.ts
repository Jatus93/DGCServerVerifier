import { Router } from 'express';
import * as middleware from './middleware';
import * as controller from './controller';
import { API } from '../index';

export default class GreenApi implements API {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  setupApi(): void {
    this.router.post('/green',middleware.canGet,controller.get);
  }
}
