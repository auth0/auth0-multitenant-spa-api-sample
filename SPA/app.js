var express   = require('express');
var path      = require('path');
var logger    = require('morgan');
var app       = express();
var tenants   = require('./../tenants');
var _         = require('lodash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

function getTenantFromDomain(host){
  var re = new RegExp(/(\w+)-yourcompany.com$/);
  var matches = host.match(re);
  if (matches && matches.length > 1){
    return matches[1];
  }
  return null;
}

//get tenant name from hostname and render index page with the auth0 domain and clientID for that tenant
app.get('/', function(req, res, next) {
  var tenantName = getTenantFromDomain(req.hostname);
  if (!tenantName) return next("Invalid domain "+req.hostname);

  var tenantConfig = _.find(tenants,'name',tenantName);
  if (!tenantConfig) return next('Invalid Tenant '+tenantName);

  var loginConfig = {
    auth0Domain: tenantConfig.auth0Domain,
    auth0ClientId: tenantConfig.auth0ClientId
  };
  res.render('index', loginConfig);

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
