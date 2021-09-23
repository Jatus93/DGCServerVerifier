export class RuleDownloader {
  static instance: RuleDownloader;
  private readonly baseUrl = 'https://get.dgc.gov.it';
  private readonly timeSpan = 86400000;
  private readonly keyStorage = 'rules'
  //   private readonly timeSpan = 1000;
  public rules:unknown = {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(){
    this.getRules();
  }

  public getRules(): unknown {
    const savedData = JSON.parse(localStorage.getItem(this.keyStorage) || '{}');
    if(savedData.lastupdateDate == null || Date.now() - savedData?.lastupdateDate > this.timeSpan){
      this.getSettings()
        .then(() => { console.log('could not read the certificates from the local file'); return this.rules; })
        .catch(console.error);
    }
    console.log('cerficates collection is valid loading from local source');
    //   console.log(dataRead.certificates);
    this.rules = savedData.certificates;
    return this.rules;
  }

  private async getSettings(): Promise<unknown>{
    const response = await fetch(`${this.baseUrl}/v1/dgc/settings`);
    const jsonData = await response.json();
    // this.rules = Rule.fromJSON(jsonData,{valueSets, validationClock:new Date().toISOString(),})
    this.rules = jsonData;
    localStorage.setItem(this.keyStorage, JSON.stringify({rules:this.rules,lastupdateDate:Date.now()}));
    return jsonData;
  }
}