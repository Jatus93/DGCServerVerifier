import fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';

export class RuleDownloader {
  static instance: RuleDownloader;
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly timeSpan = 86400000;
  private readonly keyStorage = 'rules.json'
  public rules:unknown[] = []

  public async getRules(): Promise<unknown[]> {
    let data = '{}';
    try {
      const file = await fs.open(this.keyStorage,'r');
      data = (await file.readFile()).toString('utf-8') || '{}';
      await file.close();
      const savedData = JSON.parse(data);
      if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
        await this.getSettings();
      } else {
        this.rules = savedData.rules;
      }    
      return this.rules;
    } catch (error) {
      if(error.message == 'ENOENT: no such file or directory, open \'rules.json\''){
        await fs.writeFile(this.keyStorage,'{}');
        return this.getRules();
      }
    }
  }

  private async getSettings(): Promise<unknown[]>{
    const response:AxiosResponse<unknown[]> = await axios.get(`${this.baseUrl}/v1/dgc/settings`);
    const jsonData = response.data;
    this.rules = jsonData;
    const file = await fs.open(this.keyStorage,'w');
    await file.writeFile(JSON.stringify({rules:this.rules,lastupdateDate:Date.now()}));
    await file.close();
    return jsonData;
  }
}