import { CertificateDownloader } from './CertificateDownloader';
import { RuleDownloader } from './RuleDownloader';
import {DCC} from 'dcc-utils';
import jsrsasign from 'jsrsasign';

export default class Verifier {
  static instance: Verifier|undefined  =  undefined;
  private certDownloader: CertificateDownloader;
  private ruleDownloader: RuleDownloader;
  private certificateList: string[] = [];

  private constructor(){
    this.certDownloader = new CertificateDownloader();
    this.ruleDownloader = new RuleDownloader();
  }

  public static async instanceVerifier(): Promise<Verifier>{
    if (Verifier.instance == undefined){
      Verifier.instance = new Verifier();
      Verifier.instance.certificateList = await Verifier.instance.certDownloader.getCertificates();
    }
    return Verifier.instance;
  }
  
  async checkCertificate(certificate:string): Promise<unknown>{
    const dcc = await DCC.fromRaw(certificate);
    let result: unknown;
    this.certificateList.forEach(async (cert: string) => {
      const verifier = jsrsasign.KEYUTIL.getKey(cert);
      if (typeof verifier == typeof jsrsasign.KJUR.crypto.ECDSA ){
        const xyCoord = (verifier as jsrsasign.KJUR.crypto.ECDSA).getPublicKeyXYHex();
        result = await dcc.checkSignature(xyCoord);
      }
    });
    console.log(result);    
    return result;
  }
}
