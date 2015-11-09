var tenants = require('./../tenants');
var users = require('./users');
var _ = require('lodash');

var data = module.exports = {};

data.getTenantByIssuer = function(issuer){
	var domain = require('url').parse(issuer).hostname;
	console.log('tenants',tenants,'auth0Domain',domain);
	return _.find(tenants,{auth0Domain:domain});
};

data.getUsersByTenantIdentifier = function(identifier, done){
  return done(null, users[identifier]);
};