var expressJwt  = require('express-jwt');
var express     = require('express');
var app         = express();
var LRU         = require('lru-cache');
var data        = require('./data');
var logger      = require('morgan');
var cors        = require('cors');
var request     = require('request');
var _           = require('lodash');
var http        = require('http');
var tenantMiddleware = require('./tenant-middleware');

var secretsCacheOptions = {
  // 5 M unicode points => ~10 MB
  max: 1024 * 1024 * 5,
  length: function (s) { return s.length; },
  maxAge: 1000 * 60 * 5
};
var secretsCache = LRU(secretsCacheOptions);

function certToPEM (cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = "-----BEGIN CERTIFICATE-----\n" + cert;
  cert = cert + "\n-----END CERTIFICATE-----\n";
  return cert;
}

function secretCallback (req, header, payload, cb){

  var cacheKey = payload.iss + '|' + payload.aud ;
  var cachedSecret = secretsCache.get(cacheKey);
  console.log('cacheKey',cacheKey, 'cachedSecret',cachedSecret); 
  if (cachedSecret) { 
    return cb(null, cachedSecret);
  }

  var tenant = data.getTenantByIssuer(payload.iss);
  if (!tenant) { 
    return cb(new Error('Invalid issuer '+payload.iss)); 
  }

  switch (header.alg) {
    case 'HS256': //client secret
      var secret = new Buffer(tenant.secret, 'base64');
      secretsCache.set(cacheKey, secret);
      return cb(null, secret);
    case 'RS256': // asymmetric keys
      var url = payload.iss + '.well-known/jwks.json';
      
      // FIXME: Disableing strictSSL for now to allow self-signed certs from VM.
      //        Add a proper CA here.
      request.get(url, { json: true, strictSSL: false }, function (err, resp, jwks) {
        if (err) {
          return cb(err);
        }
        if (resp.statusCode !== 200) {
          return cb(new Error('Failed to obtain JWKS from ' + payload.iss));
        }
        
        // TODO: Make this more resilient to JWKS and tokens that don't indicate a kid.
        var key = _.find(jwks.keys, function(key) {
          return key.kid == header.kid;
        });
        
        if (!key) {
          return cb(new Error('Failed to obtain signing key used by ' + payload.iss));
        }
        // TODO: Make this more resilient to keys that don't include x5c
        var publicKey = certToPEM(key.x5c[0]);
        secretsCache.set(cacheKey, publicKey);
        return cb(null, publicKey);
      });
      break;
    default:
      return cb(new Error('Unsupported JWT algorithm: ' + header.alg));
  }
}

app.use(logger('dev'));

//enable cors since SPA client is calling the API from a different port number
app.use(cors());

// to protect /api routes with JWTs
app.use('/api', expressJwt({
  secret: secretCallback,
  algorithms: [ 'HS256','RS256']
}));

app.get('/api/users',
  tenantMiddleware(), //adds tenantId to req from JWT's issuer claim
  function (req, res, next) {
    data.getUsersByTenantIdentifier(req.tenantName, function(err, users){
      if (err) return next(err);
      res.json(users);
    });
});

app.use('/api', function(err, req, res, next){
  console.log('error',err, err.stack);
  if (err.status){
    return res.status(err.status).json({ name: err.name, code: err.code });
  }
  next();
});

var server = http.createServer(app).listen(8080);
server.on('listening', function(){
  console.log('listening on http://localhost:8080');
});
