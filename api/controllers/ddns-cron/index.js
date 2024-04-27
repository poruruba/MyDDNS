'use strict';

const base_url = "[作成した関数URL]";
const API_KEY = "[任意のAPIキー]";

const fetch = require('node-fetch');
const Headers = fetch.Headers;

exports.handler = async (event, context, callback) => {
  var result = await do_post(base_url + "/ddns-sync", {}, API_KEY);
  console.log(result);
};

function do_post(url, body, apikey) {
  const headers = new Headers({ "Content-Type": "application/json", "X-API-KEY": apikey });

  return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers
    })
    .then((response) => {
      if (!response.ok)
        throw new Error('status is not 200');
      return response.json();
    });
}
