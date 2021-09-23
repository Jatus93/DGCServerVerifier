// import crypto from 'crypto';
export class CertificateDownloader{
  static instance: CertificateDownloader;
  // private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly keyStorage = 'cerificate_collection';
  private readonly timeSpan = 86400000;
  //   private readonly timeSpan = 1000;
  private cerficateCollection = {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor(){}

  public getCertificates(): unknown {
    const savedData = JSON.parse(localStorage.getItem(this.keyStorage) || '{}');
    if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
      this.getAllCertificate()
        .then(() => { console.log('could not read the certificates from the local file'); return this.cerficateCollection })
        .catch(console.error);
    }
    console.log('cerficates collection is valid loading from local source');
    //   console.log(dataRead.certificates);
    this.cerficateCollection = savedData.certificates;
    return this.cerficateCollection;
  }

  public static getCertificateDownloader():CertificateDownloader{
    if(CertificateDownloader.instance == undefined){
      CertificateDownloader.instance = new CertificateDownloader();
    }
    return CertificateDownloader.instance;
  }

  async getAllCertificate(): Promise<void> {
    this.cerficateCollection = {};
    const response = (await fetch('https://raw.githubusercontent.com/lovasoa/sanipasse/master/src/assets/Digital_Green_Certificate_Signing_Keys.json'));
    if(response.ok){
      this.cerficateCollection = await response.json();
      console.log(response);
      const lastupdateDate = Date.now();
      localStorage.setItem(this.keyStorage, JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}))
      // fs.writeFile('./cerificate_collection.json', JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}),'utf8',console.error);
    }else{
      throw new Error(response.statusText);
    }
  }
}