var assert = require('assert-plus');
var request = require('request');
var logger = require('../logger/logger').logger;
var vehicleHistoryModel = require('vehicle-history-model');
var ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var exports = {};

var jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

var isExampleVehicle = function isExampleVehicle(searchCarRequest, exampleConfig) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(searchCarRequest.plate, 'searchCarRequest.plate');
  assert.object(exampleConfig, 'exampleConfig');
  assert.string(exampleConfig.plate, 'exampleConfig.plate');

  return searchCarRequest.plate === exampleConfig.plate;
};

var reqex = function (body, re) {
  var res = null;
  while (res = re.exec(body)) {
    return res.length > 0 ? res[1].trim() : null;
  }

  return null;
};

var buildForm = function buildForm(searchCarRequest, body, formConfig) {
  logger.debug('buildForm');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(body, 'body');
  assert.object(formConfig, 'formConfig');

  var form = {};

  for (var fieldIndex in formConfig.fields) {
    if (formConfig.fields.hasOwnProperty(fieldIndex)) {
      var field = formConfig.fields[fieldIndex];
      var value = null;

      if (field.searchCarRequestField) {
        value = searchCarRequest[field.searchCarRequestField];
      }
      else if (field.fieldDefaultValue) {
        value = field.fieldDefaultValue;
      }
      else if (field.fieldRegex) {
        value = reqex(body, eval(field.fieldRegex));
      }

      if (value === null) {
        logger.debug('Failed to parse form param: ' + field.fieldName);
        throw new ServiceUnavailableError('Unable to prepare data');
      }

      form[field.fieldName] = value;
    }
  }

  return form;
};

var callMainPage = function callMainPage(formConfig, callback) {
  logger.debug('callMainPage');

  assert.object(formConfig, 'formConfig');
  assert.object(formConfig.headers, 'formConfig.headers');
  assert.number(formConfig.timeout, 'formConfig.timeout');

  var options = {
    url: formConfig.url,
    method: 'GET',
    followRedirect: true,
    headers: formConfig.headers,
    jar: jar,
    timeout: formConfig.timeout
  };

  try {
    requestWithJar(options, function (error, response, body) {
      if (error) {
        logger.info('error on callMainPage: ', error);
        return callback(new ServiceUnavailableError('Unable to get vehicle history'));
      }

      return callback(error, body);
    });
  }
  catch (err) {
    logger.info('Unable to connect: %s', err);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }
};

var prepareFormData = function prepareFormData(searchCarRequest, formConfig, callback) {
  logger.debug('prepareFormData');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(formConfig, 'formConfig');

  callMainPage(formConfig, function (error, body) {

    if (error) {
      logger.error(error);
      return callback(error);
    }

    //TODO CONFIG
    var postUrlRegex = eval('/action=\"(http.+?' + formConfig.postUrlHost + '\\/strona\-glowna.+?)\" class/g');
    var parsedUrl = reqex(body, postUrlRegex);

    if (!parsedUrl) {
      return callback(new Error('Failed to parse form url'));
    }

    var url = entities.decode(parsedUrl);

    try {
      var form = buildForm(searchCarRequest, body, formConfig);

      return callback(error, {form: form, url: url});
    }
    catch (err) {
      return callback(err);
    }
  });
};

var loadExampleVehicleHistory = function loadExampleVehicleHistory(searchCarRequest, exampleConfig, callback) {

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(exampleConfig, 'exampleConfig');
  assert.string(exampleConfig.url, 'exampleConfig.url');
  assert.number(exampleConfig.timeout, 'exampleConfig.timeout');

  var opt = {
    url: exampleConfig.url,
    method: 'GET',
    followRedirect: true,
    jar: jar,
    timeout: exampleConfig.timeout
  };

  try {
    requestWithJar(opt, function (error, response, body) {

      if (error) {
        logger.info('error on loadExampleVehicleHistory: ', error);
        return callback(new ServiceUnavailableError('Unable to get example vehicle history'));
      }

      if (response.statusCode !== 200) {
        logger.info('Invaid response code: ' + response.statusCode);
        return callback(new ServiceUnavailableError('Unable to get example vehicle history'));
      }

      return callback(null, body);
    });
  }
  catch (err) {
    logger.info('Unable to connect: %s', err);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }
};

var loadVehicleHistory = function loadVehicleHistory(formData, formConfig, callback) {
  logger.debug('loadVehicleHistory');

  assert.object(formData, 'formData');
  assert.string(formData.url, 'formData.url');
  assert.object(formConfig, 'formConfig');
  assert.object(formConfig.headers, 'formConfig.headers');
  assert.number(formConfig.timeout, 'formConfig.timeout');

  var opt = {
    url: formData.url,
    method: 'POST',
    form: formData.form,
    followRedirect: true,
    headers: formConfig.headers,
//    gzip: true,
    jar: jar,
    timeout: formConfig.timeout
  };

  try {
    requestWithJar(opt, function (error, response, body) {

      if (error) {
        logger.info('error on loadVehicleHistory: ', error);
        return callback(error);
      }

      switch (response.statusCode) {
        case 302 :
          var location = response.headers.location;
          logger.debug('request for: ' + location);

          //override url for redirect
          opt.url = location;

          requestWithJar(opt, function (error, response, body) {
            return callback(null, body);
          });

          break;
        case 400 :
          logger.info('Unable to get data from service: status 400');
          return callback(new ServiceUnavailableError('Unable to get data from service'));
//      case 200 :
        default:
          return callback(null, body);
      }
    });
  }
  catch (err) {
    logger.info('Unable to connect: %s', err);
    return callback(new ServiceUnavailableError('Unable to get vehicle history'));
  }
};

var getVehicleHistory = function getVehicleHistory(searchCarRequest, options, callback) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  var exampleConfig = options.get('example');
  var formConfig = options.get('form');

  if (isExampleVehicle(searchCarRequest, exampleConfig)) {
    return loadExampleVehicleHistory(searchCarRequest, exampleConfig, callback);
  }

  return prepareFormData(searchCarRequest, formConfig, function (err, formData) {
    if (err) {
      logger.error('getVehicleHistory returned with error: ', err);
      return callback(err);
    }

    return loadVehicleHistory(formData, formConfig, callback);
  });
};

module.exports = {
  isExampleVehicle: isExampleVehicle,
  buildForm: buildForm,
  prepareFormData: prepareFormData,
  callMainPage: callMainPage,
  loadExampleVehicleHistory: loadExampleVehicleHistory,
  loadVehicleHistory: loadVehicleHistory,
  getVehicleHistory: getVehicleHistory
};