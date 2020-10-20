const https = require('https');

const MUSIC_DELIVERY_API_HOST = "music-delivery.uat.api.universalproductionmusic.com";
const BASE_SITE = "https://login.microsoftonline.com"
const ACCESS_TOKEN_PATH = "/bbcb6b2f-8c7c-4e24-86e4-6c36fed00b78/oauth2/v2.0/token"
const CLIENT_ID = "{client id}";
const CLIENT_SECRET = "{client secret}";
const SCOPE = "{scope}";
const API_KEY = "{api key for rate limiting}";

const OAuth = require('oauth');
const OAuth2 = OAuth.OAuth2;    
const oauth2 = new OAuth2(CLIENT_ID,
  CLIENT_SECRET, 
  BASE_SITE, 
  null,
  ACCESS_TOKEN_PATH, 
  null);

const getMetadataChangesQuery = (lastTouchedOnDate) => `{ metadataChanges(lastTouchedOn: "${lastTouchedOnDate}", pageIndex: 1, pageSize: 1000) { items { trackId, workId, isDeactivated, touchedOn }, totalNumberOfItems  } }`;

oauth2.getOAuthAccessToken('',
  {'grant_type':'client_credentials', 'scope': SCOPE},
  function (e, access_token) {
    if (e) {
      console.log(e);
    } else {
      const options = {
        hostname: MUSIC_DELIVERY_API_HOST,
        port: 443,
        path: '/v1/graphql',
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "Authorization": `Bearer ${access_token}` 
        }
      };
      console.log(options);

      const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
      
        res.on('data', (d) => {
          process.stdout.write(d);
        });
      });
      
      req.on('error', (e) => {
        console.error(e);
      });

      const body = JSON.stringify({query: getMetadataChangesQuery("2020-10-15T00:00:00Z")})
      req.write(body);
      req.end(); 
    }
});
