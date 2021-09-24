import {DCC} from 'dcc-utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface checkResult {
  valid: boolean;
  message: string;
  type: string;
}

export class VaccineVerifier {
  private readonly vaccineStartDayNotComplete = 'vaccine_start_day_not_complete';
  private readonly vaccineEndDayNotComplete = 'vaccine_end_day_not_complete';
  private readonly vaccineStartDayComplete = 'vaccine_start_day_complete';
  private readonly vaccineEndDayComplete = 'vaccine_end_day_complete';
  private readonly recoveryCertStartDay = 'recovery_cert_start_day';
  private readonly recoveryCertEndDay = 'recovery_cert_end_day';
  private readonly rapidTestStartHour = 'rapid_test_start_hours';
  private readonly rapidTestEndHour = 'rapid_test_end_hours';
  private readonly molecularTestStartHour = 'molecular_test_start_hours';
  private readonly molecularTestEndHour = 'molecular_test_end_hours';
  private readonly positiveTest = '260373001';
  private readonly negativeTest = '260415000';
  private readonly rapidTest = 'LP217198-3'; 	// RAT, Rapid Antigen Test
  private readonly molecularTest = 'LP6464-4';	// NAAT, Nucleic Acid Amplification Test

  settings=[];
  certTypes=['r','v','t',]

  private checkVaccine = (payload:any):checkResult => {
    const inoculationDate = dayjs(payload.dt);
    const validRulesSet = this.getRulesSet(payload.mp);
    const vaccineDiff = payload.sd - payload.dn;
    const baseRuleIndex = validRulesSet.findIndex((elem:any)=>{ return elem.name == this.vaccineEndDayComplete;});
    if( baseRuleIndex == -1)
      return {valid:false, message:'Invaild set of rules check with operator', type:'vaccine'};
    if(vaccineDiff <= 0){
      return this.getLogicValidityDays(validRulesSet, this.vaccineStartDayComplete, this.vaccineEndDayComplete,inoculationDate);
    } else {
      return this.getLogicValidityDays(validRulesSet, this.vaccineStartDayNotComplete, this.vaccineEndDayNotComplete,inoculationDate);
    }
  }

  private checkRecovery = (payload:any):checkResult => {
    const now = dayjs();
    const dateFrom = dayjs(payload.df);
    const dateEnd = dayjs(payload.du);
    if(now.isAfter(dateFrom) && now.isBefore(dateEnd)){
      return{valid:true, message:'Certificate is valid', type:'recovery'};
    }
    return {valid:false, message:'toimplement', type:'recovery'};
  }

  private checkTest = (payload:any):checkResult => {
    const validRulesSet = this.getRulesSet('GENERIC');
    const testType = payload.tt;
    if(payload.tr === this.positiveTest)
      return {valid:false, message:'The test detected the virus',type:'test'};
    const collectionDateTime = dayjs.tz(payload.sc,'UTC').tz(dayjs.tz.guess());
    if(testType  == this.rapidTest){
      return this.getLogicValidityHours(validRulesSet,this.rapidTestStartHour,this.rapidTestEndHour,collectionDateTime);
    }
    if(testType ==  this.molecularTest){
      return this.getLogicValidityHours(validRulesSet,this.molecularTestStartHour,this.molecularTestEndHour,collectionDateTime);
    }
    return {valid:false, message:'unknown test type',type:'test'};
  }

  private functionSelector = {
    'v':this.checkVaccine,
    'r':this.checkRecovery,
    't':this.checkTest
  }

  constructor(settings:unknown[]) {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    this.settings = settings;
  }

  public checkCertifcate(pass:DCC):checkResult {
    console.log(pass.payload);
    const payloadAndType = this.getPayloadAndType(pass);
    const result: checkResult = this.functionSelector[payloadAndType.key](payloadAndType.payload);
    return result;
  }

  private getPayloadAndType(pass:DCC): {key:string,payload:unknown}{
    const result:{key:string,payload:unknown} = {key:'',payload:[]};
    this.certTypes.forEach((key:string) => {
      if(pass.payload[key] !=  undefined){
        if((pass.payload[key] as unknown[]).length != 0){
          result.key =(key);
          result.payload = (pass.payload[key][pass.payload[key].length -1]);
        }
      }
    });
    return result;
  }

  private getRulesSet(type:string): unknown[]{
    return this.settings.filter((rule:unknown)=>{
      return rule['type'] =  type;
    });
  }

  private getLogicValidityDays(validRulesSet:unknown[],startKey:string, endKey:string, inoculationDate: dayjs.Dayjs): checkResult {
    const now = dayjs();
    const ruleStart = validRulesSet.find((elem:any)=>{return elem.name == startKey;});
    const ruleEnd = validRulesSet.find((elem:any)=>{return elem.name == endKey;});
    const startValidity = inoculationDate.add(parseInt(ruleStart['value']),'days');
    const endValidity = inoculationDate.add(parseInt(ruleEnd['value']),'days');
    if(startValidity.isAfter(now)) return {valid:false, message:'Certificate not yet valid', type:'vaccine'};
    if(now.isAfter(endValidity)) return {valid:false, message:'Certificate not more valid', type:'vaccine'};
    return {valid:true, message:'Certificate is valid', type:'vaccine'};
  }

  private getLogicValidityHours(validRulesSet:unknown[],startKey:string, endKey:string, inoculationDate: dayjs.Dayjs): checkResult {
    const now = dayjs();
    const ruleStart = validRulesSet.find((elem:any)=>{return elem.name == startKey;});
    const ruleEnd = validRulesSet.find((elem:any)=>{return elem.name == endKey;});
    const startValidity = inoculationDate.add(parseInt(ruleStart['value']),'hours');
    const endValidity = inoculationDate.add(parseInt(ruleEnd['value']),'hours');
    if(startValidity.isAfter(now)) return {valid:false, message:'Certificate not yet valid', type:'test'};
    if(now.isAfter(endValidity)) return {valid:false, message:'Certificate not more valid', type:'test'};
    return {valid:true, message:'Certificate is valid', type:'test'};
  }
}