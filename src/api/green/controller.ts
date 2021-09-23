import { Request, Response } from 'express';
import Verifier from '../../../utils/dgcVerifier/Verifier';
let verifier:Verifier;
Verifier.instanceVerifier().then((ver)=>verifier=ver).catch(console.error);

export const get = (req: Request, res: Response):void => {
  const cert = req.body;
  const result = verifier.checkCertificate(cert);
  res.status(200).send({'data':result});
};