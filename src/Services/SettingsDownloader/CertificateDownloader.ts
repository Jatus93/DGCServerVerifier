import fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';
import { X509Certificate, PublicKey } from '@peculiar/x509';
import crypto  from 'isomorphic-webcrypto';

interface CertificateData {
  serialNumber: string,
  subject:string,
  issuer: string,
  notBefore: Date,
  notAfter: Date,
  signatureAlgorithm: any,
  fingerprint:any,
  publicKeyAlgorithm:KeyAlgorithm|any,
  publicKeyPem:string
}

export class CertificateDownloader{
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly updateApi = '/v1/dgc/signercertificate/update'
  private readonly statusApi = '/v1/dgc/signercertificate/status'
  private readonly keyStorage = './certificate_collection.json';
  private readonly timeSpan = 86400000;
  // private readonly timeSpan = 1;
  // private certificatesCollection:{kid:string,certificate:string}[] = [];
  // private certificatesCollection: { [key: string]: CertificateData; } = {};
  private certificatesCollection: Record<string, any> = {};
  private currentValidKids:string[] = [];

  public async getCertificates(): Promise<Record<string, any>> {
    let data = '{}';
    try {
      const file = await fs.open(this.keyStorage,'r');
      data = (await file.readFile()).toString('utf-8') || '{}';
      await file.close();
      const savedData = JSON.parse(data);
      if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
        await this.updateKids();
        await this.getAllCertificate();
      } else {
        this.certificatesCollection = savedData.certificates;
      }    
      return this.certificatesCollection;
    } catch (error) {
      console.log(error.message);
      if(error.message == 'ENOENT: no such file or directory, open \'./certificate_collection.json\''){
        await fs.writeFile(this.keyStorage,'{}');
        return this.getCertificates();
      }
    }
  }

  private async getAllCertificate(): Promise<void> {
    let exit = false;
    let headers = {};
    this.certificatesCollection = {};
    while(!exit){
      const response:AxiosResponse = await axios.get(this.baseUrl+this.updateApi,{headers});
      headers = {'X-RESUME-TOKEN': response.headers['x-resume-token']};
      const currentKid:string = response.headers['x-kid'];
      if(this.currentValidKids.includes(currentKid)){
        const cert = {kid:currentKid, certificate: response.data};
        this.certificatesCollection[currentKid] = await this.parseCertificate(response.data);
      }
      exit = (response.status !== 200);
    }
    const lastupdateDate = Date.now();
    const file = await fs.open(this.keyStorage,'w');
    await file.writeFile(JSON.stringify({'certificates':this.certificatesCollection, lastupdateDate}));
    console.log(this.certificatesCollection);
    await file.close();
  }

  private async updateKids(): Promise<void> {
    try {
      const resp = await axios.get(this.baseUrl+this.statusApi);
      this.currentValidKids = await resp.data as string[];
    } catch (error) {
      console.log('could not get keyChild ', error);
    }
  }

  private async parseCertificate(certificate:string):Promise<CertificateData>{ 
    const result:CertificateData = {
      serialNumber: '',
      subject: 'UNKNOWN',
      issuer: 'UNKNOWN',
      notBefore: new Date('2020-01-01'),
      notAfter: new Date('2030-01-01'),
      signatureAlgorithm: '',
      fingerprint: '',
      publicKeyAlgorithm:'',
      publicKeyPem:''
    };
    try{
      const cert = new X509Certificate(certificate);
      const publicInfo =  await this.exportKey(cert.publicKey);
      result.serialNumber = cert.serialNumber;
      result.subject = cert.subject;
      result.issuer = cert.issuer;
      result.notAfter = cert.notAfter;
      result.notBefore = cert.notBefore;
      result.signatureAlgorithm = cert.signatureAlgorithm;
      result.fingerprint = Buffer.from(await cert.getThumbprint(crypto)).toString('hex');
      result.publicKeyAlgorithm = publicInfo.publicKeyAlgorithm;
      result.publicKeyPem = publicInfo.publicKeyPem;
    } catch (error) {
      console.log('This certificate has returned this error');
      const publicInfo = await this.exportKey(new PublicKey(certificate));
      result.publicKeyAlgorithm = publicInfo.publicKeyAlgorithm;
      result.publicKeyPem = publicInfo.publicKeyPem;
    }
    return result;
  }

  /**
 * @param {PublicKey} pubkey
 * @returns {Promise<{
 * 	publicKeyAlgorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams;
   * 	publicKeyPem: string;
   * }>}
   */
  async exportKey(publicKey:PublicKey): Promise<{publicKeyAlgorithm:KeyAlgorithm, publicKeyPem:string}> {
    const public_key = await publicKey.export(crypto);
    const spki = await crypto.subtle.exportKey('spki', public_key);
  
    // Export the certificate data.
    return {
      publicKeyAlgorithm: public_key.algorithm,
      publicKeyPem: Buffer.from(spki).toString('base64')
    };
  }
}