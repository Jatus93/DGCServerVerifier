import { CertificateDownloader } from './CertificateDownloader';
import { RuleDownloader } from './RuleDownloader';
import {DCC} from 'dcc-utils';

export default class Verifier {
  static certDownloader: CertificateDownloader;
  static ruleDownloader: RuleDownloader;
  static certificateList: unknown;

  static async setup():Promise<void> {
    Verifier.certDownloader = CertificateDownloader.getCertificateDownloader();
    Verifier.ruleDownloader = RuleDownloader.getRuleDownloader(); 
    Verifier.certificateList = await Verifier.certDownloader.getCertificates();
  }

  static async checkCertificate(certificate:string): Promise<unknown>{
    const dcc = await DCC.fromRaw(certificate);
    const certCheck = await dcc.checkSignatureWithKeysList(Verifier.certificateList);
    return certCheck;
  }
}
