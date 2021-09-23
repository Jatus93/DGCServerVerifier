import { Router } from 'express';
import * as exampleMW from './middleware';
import * as exampleCtrl from './controller';
import { API } from '../index';

export default class GreenApi implements API {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  setupApi():void {
    this.router.get('/example',exampleMW.canGet,exampleCtrl.get);
  }
}
