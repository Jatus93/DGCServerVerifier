import { RuleDownloader } from './RuleDownloader';
import mock from 'mock-fs';
import axios, { AxiosResponse } from 'axios';
jest.mock('axios');
const mockRules = [{'name':'vaccine_end_day_complete','type':'EU/1/20/1525','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1525','value':'15'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1525','value':'365'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1525','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/21/1529','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/21/1529','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/21/1529','value':'84'},{'name':'vaccine_start_day_not_complete','type':'EU/1/21/1529','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/20/1507','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1507','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1507','value':'42'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1507','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/20/1528','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1528','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1528','value':'42'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1528','value':'15'},{'name':'rapid_test_start_hours','type':'GENERIC','value':'0'},{'name':'rapid_test_end_hours','type':'GENERIC','value':'48'},{'name':'molecular_test_start_hours','type':'GENERIC','value':'0'},{'name':'molecular_test_end_hours','type':'GENERIC','value':'48'},{'name':'recovery_cert_start_day','type':'GENERIC','value':'0'},{'name':'recovery_cert_end_day','type':'GENERIC','value':'180'},{'name':'ios','type':'APP_MIN_VERSION','value':'1.1.0'},{'name':'android','type':'APP_MIN_VERSION','value':'1.1.0'}];

const ruleDownloader = new RuleDownloader();

const mockedAxios = axios  as jest.Mocked<typeof axios>;
const successResposnse: AxiosResponse = {
  // data:[{'name':'vaccine_end_day_complete','type':'EU/1/20/1525','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1525','value':'15'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1525','value':'365'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1525','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/21/1529','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/21/1529','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/21/1529','value':'84'},{'name':'vaccine_start_day_not_complete','type':'EU/1/21/1529','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/20/1507','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1507','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1507','value':'42'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1507','value':'15'},{'name':'vaccine_end_day_complete','type':'EU/1/20/1528','value':'365'},{'name':'vaccine_start_day_complete','type':'EU/1/20/1528','value':'0'},{'name':'vaccine_end_day_not_complete','type':'EU/1/20/1528','value':'42'},{'name':'vaccine_start_day_not_complete','type':'EU/1/20/1528','value':'15'},{'name':'rapid_test_start_hours','type':'GENERIC','value':'0'},{'name':'rapid_test_end_hours','type':'GENERIC','value':'48'},{'name':'molecular_test_start_hours','type':'GENERIC','value':'0'},{'name':'molecular_test_end_hours','type':'GENERIC','value':'48'},{'name':'recovery_cert_start_day','type':'GENERIC','value':'0'},{'name':'recovery_cert_end_day','type':'GENERIC','value':'180'},{'name':'ios','type':'APP_MIN_VERSION','value':'1.1.0'},{'name':'android','type':'APP_MIN_VERSION','value':'1.1.0'}],
  data: mockRules,
  status: 200,
  statusText: 'OK',
  headers:{
    'Content-Type': 'application/json',
    'Cache-control': 'private',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  },
  config: {}
};

describe('RuleDownloader', ()=>{
  describe('getRules',()=>{
    test('Testing getRules basic outcome: file loaded from local source and is still valid',async ()=>{
      mock({
        './rules.json': Buffer.from(JSON.stringify({rules:mockRules,lastupdateDate:Date.now()}))
      });
      const rules = await ruleDownloader.getRules();
      mock.restore();
      expect(JSON.stringify(rules)).toBe(JSON.stringify(mockRules));
    });
    test('Testing getRules basic outcome: file loaded from local source is expired download a new one',async ()=>{
      mockedAxios.get.mockResolvedValueOnce(successResposnse);
      const date = Date.now() - 86400010;
      mock({
        './rules.json': Buffer.from(JSON.stringify({rules:mockRules,lastupdateDate:date}))
      });
      expect(axios.get).not.toHaveBeenCalled();
      const rules = await ruleDownloader.getRules();
      expect(axios.get).toHaveBeenCalled();
      mock.restore();
      expect(JSON.stringify(rules)).toBe(JSON.stringify(mockRules));
    });
    // test('Testing getRules basic outcome: file loaded from local source and is still valid',async ()=>{
    //   mockedAxios.get.mockResolvedValueOnce(successResposnse);
    //   expect(axios.get).not.toHaveBeenCalled();
    //   const rules = await ruleDownloader.getRules();
    //   expect(axios.get).toHaveBeenCalled();
    // });
  });
});
