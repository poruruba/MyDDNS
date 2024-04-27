'use strict';

const HELPER_BASE = process.env.HELPER_BASE || "/opt/";
const Response = require(HELPER_BASE + 'response');

const AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-northeast-1",
});
const route53 = new AWS.Route53();

const HOSTEDZONEID = "[ホストゾーンID]";
const HOSTNAME = "[ホスト名]";
const API_KEY = "[任意のAPIキー]";

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body);

  if( event.headers["x-api-key"] != API_KEY )
    throw new Error("apikey invalid");
    
  if( event.rawPath == "/ddns-sync" ){
    const sourceIp = event.requestContext.http.sourceIp;
    console.log("sourceIp=" + sourceIp);
  
    const params_list = {
      HostedZoneId: HOSTEDZONEID,
      StartRecordType: "A",
      StartRecordName: HOSTNAME,
      MaxItems: "1"
    };
    const result_list = await route53.listResourceRecordSets(params_list).promise();
    console.log(JSON.stringify(result_list));
    
    let status;
    const item = result_list.ResourceRecordSets.find(item => item.Name == HOSTNAME );
    console.log(item);
    if( item && item.ResourceRecords.find(item => item.Value == sourceIp ) ){
      console.log("same value found");
      status = "Not Change";
    }else{
      const params_change = {
        HostedZoneId: HOSTEDZONEID,
        ChangeBatch: {
          Changes:[
            {
              Action: "UPSERT",
              ResourceRecordSet:{
                Name: HOSTNAME,
                Type: "A",
                TTL: 300,
                ResourceRecords: [
                  {
                    Value: sourceIp
                  }
                ]
              }
            }
          ] 
        }
      };
      const result_change = await route53.changeResourceRecordSets(params_change).promise();
      console.log(result_change);
      status = result_change.ChangeInfo.Status;
    }
  
    return new Response({
      sourceIp: sourceIp,
      status: status
    });
  }else
  {
    throw new Error("unknown endpoint");
  }
};
