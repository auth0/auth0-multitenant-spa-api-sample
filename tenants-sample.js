// represents tenant storage
module.exports = [
  {
  	name: 'tenant1',
    auth0Domain: 'TENANT1_NAMESPACE.auth0.com',
    auth0ClientId:'TENANT1_CLIENT_ID',
    apiClientAudience:'TENANT1_API_AUDIENCE'
  },
  {
  	name: 'tenant2',
    auth0Domain: 'TENANT2_NAMESPACE.auth0.com',
    auth0ClientId:'TENANT2_CLIENT_ID',
    apiClientAudience:'TENANT2_API_AUDIENCE',
    secret: 'TENANT2_SECRET'
  }
];

