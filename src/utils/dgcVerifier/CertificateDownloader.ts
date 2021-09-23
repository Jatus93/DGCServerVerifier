import fs from 'fs/promises';
export class CertificateDownloader{
  // static instance: CertificateDownloader;
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly updateApi = '/v1/dgc/signercertificate/update'
  private readonly statusApi = '/v1/dgc/signercertificate/status'
  private readonly keyStorage = './cerificate_collection.json';
  private readonly timeSpan = 86400000;
  private cerficateCollection:string[] = [];
  private currentValidKids = [];

  public constructor(){
    this.getCertificates();
  }

  public async getCertificates(): Promise<string[]> {
    const file = await fs.open(this.keyStorage,'r');
    const data = await file.readFile();
    const savedData = JSON.parse( data.toString() || '{}');
    if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
      this.getAllCertificate()
        .then(() => { console.log('could not read the certificates from the local file'); return this.cerficateCollection; })
        .catch(console.error);
    }
    console.log('cerficates collection is valid loading from local source');
    this.cerficateCollection = savedData.certificates;
    return this.cerficateCollection;
  }

  // public static getCertificateDownloader():CertificateDownloader{
  //   if(CertificateDownloader.instance == undefined){
  //     CertificateDownloader.instance = new CertificateDownloader();
  //   }
  //   return CertificateDownloader.instance;
  // }

  // async getAllCertificate(): Promise<void> {
  //   this.cerficateCollection = {};
  //   const response = (await fetch('https://raw.githubusercontent.com/lovasoa/sanipasse/master/src/assets/Digital_Green_Certificate_Signing_Keys.json'));
  //   if(response.ok){
  //     this.cerficateCollection = await response.json();
  //     console.log(response);
  //     const lastupdateDate = Date.now();
  //     const file = await fs.open(this.keyStorage,'rw');
  //     file.writeFile(JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}));
  //   }else{
  //     throw new Error(response.statusText);
  //   }
  // }

  async getAllCertificate(): Promise<void> {
    let exit = false;
    let headers = {};
    this.cerficateCollection = [];
    while(!exit){
      const response = await fetch(this.baseUrl+this.updateApi,{headers});
      headers = {'X-RESUME-TOKEN': response.headers.get('X-RESUME-TOKEN')};
      const currentKid:string = response.headers.get('X-KID') || '';
      if(this.currentValidKids.includes(currentKid as never)){
        const cert = await response.text();
        this.cerficateCollection.push('-----BEGIN CERTIFICATE-----\n' + cert + '-----END CERTIFICATE-----');
      }
      exit = (response.status !== 200);
    }
    const lastupdateDate = Date.now();
    const file = await fs.open(this.keyStorage,'rw');
    file.writeFile(JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}));
  }

  async updateKids(): Promise<void> {
    try {
      const resp = await fetch(this.baseUrl+this.statusApi);
      this.currentValidKids = await resp.json();
    } catch (error) {
      console.log('could not get keyChild ', error);
    }
  }
}