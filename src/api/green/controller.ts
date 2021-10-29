import { Request, Response } from 'express';
import Verifier from '../../Services/dgcVerifier/Verifier';
let verifier:Verifier;
Verifier.instanceVerifier().then((ver:Verifier)=>verifier=ver).catch(console.error);

export const get = async (req: Request, res: Response):Promise<void> => {
  const cert = req.body['key'];
  try {
    const result = await verifier.checkCertificate(cert);
    // const result = '';
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send({message:'unsigned certificate',error});
  }
};