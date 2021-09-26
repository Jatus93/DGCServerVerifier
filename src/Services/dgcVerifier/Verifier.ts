import { CertificateDownloader } from '../SettingsDownloader/CertificateDownloader';
import { RuleDownloader } from '../SettingsDownloader/RuleDownloader';
import { CheckResult, VaccineVerifier } from './VaccineVerifier';
import {DCC} from 'dcc-utils';
import jsrsasign from 'jsrsasign';
interface certificateResponse {
  signature:{
    valid: boolean
  },
  valid:CheckResult,
  info:{
    identity:{
      fnt:string,
      fn:string,
      gnt:string,
      gn:string
    },
    dob:string
  }
}
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
  
  async checkCertificate(certificate:string): Promise<certificateResponse>{
    let result:certificateResponse = {signature:{valid: false}, valid:{valid:false, message:''}, info:{identity:{fnt:'',fn:'',gnt:'',gn:''},dob:''}};
    try {
      const dcc = await DCC.fromRaw(certificate);
      const signatureValidity = (await this.checkKey(dcc)).valid;
      const vaccineVerifier = new VaccineVerifier(await this.ruleDownloader.getRules());
      result = {signature:{valid: signatureValidity}, valid:  vaccineVerifier.checkCertifcate(dcc.payload), info:{identity:dcc.payload.nam,dob:dcc.payload.dob}};
    } catch (error) {
      console.log(error);
    }  
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
