import { CertificateDownloader } from '../SettingsDownloader/CertificateDownloader';
import { RuleDownloader } from '../SettingsDownloader/RuleDownloader';
import { CheckResult, VaccineVerifier } from './VaccineVerifier';
import {DCC} from 'dcc-utils';
interface certificateResponse {
  signature:string,
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
    let result:certificateResponse = {signature:'unsigned', valid:{valid:false, message:'nd'}, info:{identity:{fnt:'nd',fn:'nd',gnt:'nd',gn:'nd'},dob:'nd'}};
    try {
      const dcc = await DCC.fromRaw(certificate);
      const certificateSigner = await dcc.checkSignatureWithKeysList(await this.certDownloader.getCertificates());
      const vaccineVerifier = new VaccineVerifier(await this.ruleDownloader.getRules());
      console.log(dcc);
      result = {signature:JSON.stringify(certificateSigner), valid:  vaccineVerifier.checkCertifcate((dcc as any)._payload), info:{identity:(dcc as any)._payload.nam,dob:(dcc as any)._payload.dob}};
    } catch (error) {
      console.log(error);
      result = {signature:'unsigned', valid:{valid:false, message:'nd'}, info:{identity:{fnt:'nd',fn:'nd',gnt:'nd',gn:'nd'},dob:'nd'}};
    }  
    return result;
  }
}
