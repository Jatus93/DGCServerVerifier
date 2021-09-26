
import { CertificateDownloader } from './CertificateDownloader';
import mock from 'mock-fs';
import axios, { AxiosResponse } from 'axios';
jest.mock('axios');

const certifcateDownloader = new CertificateDownloader();
const testCetificate = 'MIICyzCCAnGgAwIBAgIBATAKBggqhkjOPQQDAjCBqTELMAkGA1UEBhMCREsxKTAnBgNVBAoMIFRoZSBEYW5pc2ggSGVhbHRoIERhdGEgQXV0aG9yaXR5MSkwJwYDVQQLDCBUaGUgRGFuaXNoIEhlYWx0aCBEYXRhIEF1dGhvcml0eTEcMBoGA1UEAwwTUFJPRF9DU0NBX0RHQ19ES18wMTEmMCQGCSqGSIb3DQEJARYXa29udGFrdEBzdW5kaGVkc2RhdGEuZGswHhcNMjEwNTE5MDk0NzI1WhcNMjMwNTIwMDk0NzI1WjCBqDELMAkGA1UEBhMCREsxKTAnBgNVBAoMIFRoZSBEYW5pc2ggSGVhbHRoIERhdGEgQXV0aG9yaXR5MSkwJwYDVQQLDCBUaGUgRGFuaXNoIEhlYWx0aCBEYXRhIEF1dGhvcml0eTEbMBkGA1UEAwwSUFJPRF9EU0NfREdDX0RLXzAxMSYwJAYJKoZIhvcNAQkBFhdrb250YWt0QHN1bmRoZWRzZGF0YS5kazBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABAZnYGP1TkbHnF8WP9MTTTs6CTUWlZzDJh7OY4l6xr2gzstY8w1Dsr0fvicYH9PmLhsqef1AGNECIe';
const kidHeader = 'NAyCKly+hCg=';
const testCollecion = [{kid:kidHeader,certificate:testCetificate}];
let resumeToken = 2;
const allKids = ['NAyCKly+hCg=', '25QCxBrBJvA=', 'ODqaG8mnbro=', 'e4lH6I4iMIM='];
const validKid = ['NAyCKly+hCg='];
let responseCounter = 0;

const mockedAxios = axios  as jest.Mocked<typeof axios>;
const axiosResponseCertificates = (data: any): AxiosResponse => {
  console.log('axios mock ', data);
  const status = (responseCounter < allKids.length -1)? 200 : 204;
  return {
    data: testCetificate,
    status,
    statusText: 'OK',
    headers:{
      'x-kid':allKids[responseCounter++],
      'x-resume-token':resumeToken++,
    },
    config:{}
  };
};

const axioResponseValidKids: AxiosResponse  = {
  data:  validKid,
  status: 200,
  statusText: 'OK',
  headers:{},
  config:{}
};

describe('CertificateDownloader', ()=>{
  describe('getCertificates()',()=>{
    test('Testing getCertificates basic outcome: file loaded from local source and is still valid',async ()=>{
      mock({
        './cerificate_collection.json': Buffer.from(JSON.stringify({certificates:testCollecion,lastupdateDate:Date.now()}))
      });
      const collection = await certifcateDownloader.getCertificates();
      mock.restore();
      expect(JSON.stringify(collection)).toBe(JSON.stringify(testCollecion));
    });
    // test('Testing getRules basic outcome: file loaded from local source and is expired',async ()=>{
    //   mockedAxios.get.mockResolvedValueOnce(axioResponseValidKids);
    //   mockedAxios.get.mockResolvedValueOnce(axiosResponseCertificates);

    //   const date = Date.now() - 86400010;
    //   mock({
    //     './cerificate_collection.json': Buffer.from(JSON.stringify({certificates:testCollecion,lastupdateDate:date}))
    //   });
    //   expect(axios.get).not.toHaveBeenCalled();
    //   const collection = await certifcateDownloader.getCertificates();
    //   expect(axios.get).toHaveBeenCalled();
    //   mock.restore();
    //   expect(JSON.stringify(collection)).toBe(JSON.stringify(testCollecion));
    // });
  });
});
