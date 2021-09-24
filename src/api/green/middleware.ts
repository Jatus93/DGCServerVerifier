import { Request, Response, NextFunction } from 'express';

export const canGet = (req: Request, res: Response, next: NextFunction):void => { 
  return next(); 
};