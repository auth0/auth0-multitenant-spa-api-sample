// represents tenant storage
module.exports = [
  {
  	name: 'tenant1',
    auth0Domain: 'TENANT1_NAMESPACE.auth0.com',
    auth0ClientId:'TENANT1_CLIENT_ID'
  },
  {
  	name: 'tenant2',
    auth0Domain: 'TENANT2_NAMESPACE.auth0.com',
    auth0ClientId:'TENANT2_CLIENT_ID',
    secret: 'TENANT2_SECRET'
  }
];

