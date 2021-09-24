import fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';

export class CertificateDownloader{
  // static instance: CertificateDownloader;
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly updateApi = '/v1/dgc/signercertificate/update'
  private readonly statusApi = '/v1/dgc/signercertificate/status'
  private readonly keyStorage = './cerificate_collection.json';
  // private readonly timeSpan = 86400000;
  private readonly timeSpan = 1;
  private cerficateCollection:unknown = {};
  private currentValidKids:string[] = [];

  public async getCertificates(): Promise<unknown> {
    let data = '{}';
    try {
      const file = await fs.open(this.keyStorage,'r');
      data = (await file.readFile()).toString('utf-8');
      await file.close();
      const savedData = JSON.parse( data || '{}');
      // if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
      //   await this.getAllCertificate();
      // } else {
      this.cerficateCollection = savedData.certificates;
      // }    
      return this.cerficateCollection;
    } catch (error) {
      console.log(error);
      if(error.errno == -2){
        await  fs.writeFile(this.keyStorage,'{}');
      } else {
        console.log(error);
      }
    }
  }

  // public static getCertificateDownloader():CertificateDownloader{
  //   if(CertificateDownloader.instance == undefined){
  //     CertificateDownloader.instance = new CertificateDownloader();
  //   }
  //   return CertificateDownloader.instance;
  // }

  async getAllCertificate(): Promise<void> {
    this.cerficateCollection = {};
    const response:AxiosResponse<JSON> = (await axios.get('https://raw.githubusercontent.com/lovasoa/sanipasse/master/src/assets/Digital_Green_Certificate_Signing_Keys.json'));
    if(response.status == 200){
      console.log(response.data);
      this.cerficateCollection = response.data;
      console.log(response);
      const lastupdateDate = Date.now();
      const file = await fs.open(this.keyStorage,'w');
      file.writeFile(JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}));
      console.log(this.cerficateCollection);
      await file.close();
    }else{
      throw new Error(response.statusText);
    }
  }

  // async getAllCertificate(): Promise<void> {
  //   let exit = false;
  //   let headers = {};
  //   this.cerficateCollection = [];
  //   while(!exit){
  //     // const response = await fetch(this.baseUrl+this.updateApi,{headers});
  //     const response:AxiosResponse = await axios.get(this.baseUrl+this.updateApi,{headers});
  //     // console.log(response.headers);
  //     headers = {'X-RESUME-TOKEN': response.headers['x-resume-token']};
  //     const currentKid:string = response.headers['x-kid'];
  //     if(this.currentValidKids.includes(currentKid)){
  //       // console.log('=========AGGIUNG===========');
  //       const cert = `-----BEGIN CERTIFICATE-----${response.data}-----END CERTIFICATE-----`;
  //       // console.log(cert);
  //       this.cerficateCollection.push(cert);
  //     }
  //     exit = (response.status !== 200);
  //   }
  //   const lastupdateDate = Date.now();
  //   const file = await fs.open(this.keyStorage,'w');
  //   file.writeFile(JSON.stringify({'certificates':this.cerficateCollection, lastupdateDate}));
  //   console.log(this.cerficateCollection);
  //   await file.close();
  // }

  // async updateKids(): Promise<void> {
  //   try {
  //     const resp = await axios.get(this.baseUrl+this.statusApi);
  //     this.currentValidKids = await resp.data as string[];
  //   } catch (error) {
  //     console.log('could not get keyChild ', error);
  //   }
  // }
}