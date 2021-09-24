import { CertificateDownloader } from './CertificateDownloader';
import { RuleDownloader } from './RuleDownloader';
import { VaccineVerifier } from './VaccineVerifier';
import {DCC} from 'dcc-utils';

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
    let result = await dcc.checkSignatureWithKeysList(await this.certDownloader.getCertificates());
    const vaccineVerifier = new VaccineVerifier(await this.ruleDownloader.getRules());
    result = {signature: result, valid:vaccineVerifier.checkCertifcate(dcc)};
    console.log(result);
    return result;
  }
}
