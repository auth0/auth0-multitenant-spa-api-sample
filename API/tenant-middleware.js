var data =require('./data');

module.exports = function(app){
  return function addTenant(req, res, next){
    var tenant = data.getTenantByIssuer(req.user.iss);
    req.tenantName = tenant.name;
    next();
  };
};