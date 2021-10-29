import fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';
import { X509Certificate, PublicKey } from '@peculiar/x509';
import crypto  from 'isomorphic-webcrypto';

interface CertificateData {
  serialNumber: string,
  subject:string,
  issuer: string,
  notBefore: any,
  notAfter: any,
  signatureAlgorithm: any,
  fingerprint:any
}

export class CertificateDownloader{
  // static instance: CertificateDownloader;
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly updateApi = '/v1/dgc/signercertificate/update'
  private readonly statusApi = '/v1/dgc/signercertificate/status'
  private readonly keyStorage = './certificate_collection.json';
  private readonly timeSpan = 86400000;
  // private readonly timeSpan = 1;
  // private certificatesCollection:{kid:string,certificate:string}[] = [];
  private certificatesCollection: { [key: string]: string; } = {};
  private currentValidKids:string[] = [];

  public async getCertificates(): Promise<{ [key: string]: string; }> {
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
        this.certificatesCollection[currentKid] = await parseCertificate(response.data);
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
    }parseCertificate
  }

  private async parseCertificate(certificate:string):Promise<CertificateData>{ 
    const result:CertificateData = {
      serialNumber: '',
      subject: 'UNKNOWN',
      issuer: 'UNKNOWN',
      notBefore: '2020-01-01',
      notAfter: '2030-01-01',
      signatureAlgorithm: '',
      fingerprint: '',
    }
    try{
      const cert = new X509Certificate(certificate);
    }
  }
}