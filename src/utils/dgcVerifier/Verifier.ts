import { CertificateDownloader } from './CertificateDownloader';
import { RuleDownloader } from './RuleDownloader';
import { VaccineVerifier } from './VaccineVerifier';
import {DCC} from 'dcc-utils';
import jsrsasign from 'jsrsasign';
export default class Verifier {
  static instance: Verifier|undefined  =  undefined;
  private certDownloader: CertificateDownloader;
  private ruleDownloader: RuleDownloader;
  private constructor(){
    this.certDownloader = new CertificateDownloader();
    this.ruleDownloader = new RuleDownloader();
  }

  public static async instanceVerifier(): Promise<Verifier>{
    if (Verifier.instance == undefined){
      Verifier.instance = new Verifier();
      await Verifier.instance.certDownloader.getCertificates();
      await Verifier.instance.ruleDownloader.getRules();

    }
    return Verifier.instance;
  }
  
  async checkCertificate(certificate:string): Promise<unknown>{
    console.log(certificate);
    const dcc = await DCC.fromRaw(certificate);
    console.log(dcc.payload);
    let result:unknown = {};
    result = await this.checkKey(dcc);
    const vaccineVerifier = new VaccineVerifier(await this.ruleDownloader.getRules());
    result = {signature: result, valid:  vaccineVerifier.checkCertifcate(dcc)};
    console.log(result);
    return result;
  }

  async checkKey(dcc:DCC):Promise<{valid:boolean, key?:string}>{
    const publicCertificateCollection = await this.certDownloader.getCertificates();
    const result = {valid:false, key: ''};
    for(const tupla of publicCertificateCollection){
      try {
        const cECDSA = (jsrsasign.KEYUTIL
          .getKey('-----BEGIN CERTIFICATE-----\n' + tupla.certificate+ '-----END CERTIFICATE-----') as jsrsasign.KJUR.crypto.ECDSA).getPublicKeyXYHex();
        const signCheckResult = await dcc.checkSignature(cECDSA);
        if(signCheckResult){
          result.valid = true;
          result.key = tupla.kid;
          break;
        }
      } catch (error) {
        if(error.message != 'Signature missmatch')
          console.log(error); //to silence the errors
      }
    }
    return result;
  }
}
