var request = require('request');
var logger = require('../logger/logger').logger;
var UnableFormParseError = require('../error/unableFormParseError').UnableFormParseError;
var UnableToGetDataError = require('../error/unableToGetDataError').UnableToGetDataError;

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var exports = {};

var jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

exports.isExampleVehicle = function (searchCarRequest, exampleConfig) {
  return searchCarRequest.getPlate() === exampleConfig.plate ||
    searchCarRequest.getVin() === exampleConfig.vin
    ;
};

exports.buildForm = function (searchCarRequest, body, formConfig) {
  logger.debug('buildForm');

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
        throw new UnableFormParseError('Failed to parse form param: ' + field.fieldName);
      }

      form[field.fieldName] = value;
    }
  }

  return form;
};

var reqex = function (body, re) {
  var res = null;
  while (res = re.exec(body)) {
    return res.length > 0 ? res[1].trim() : null;
  }

  return null;
};

exports.prepareFormData = function (searchCarRequest, formConfig, callback) {
  logger.debug('prepareFormData');

  exports.callMainPage(formConfig, function (error, body) {

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
      var form = exports.buildForm(searchCarRequest, body, formConfig);

      return callback(error, {form: form, url: url});
    }
    catch (err) {
      return callback(err);
    }
  });
};

exports.callMainPage = function (formConfig, callback) {
  logger.debug('callMainPage');

  var options = {
    url: formConfig.url,
    method: 'GET',
    followRedirect: true,
    headers: {
      'Accept': formConfig.headers.accept,
      'User-Agent': formConfig.headers.userAgent
    },
    jar: jar
  };

  requestWithJar(options, function (error, response, body) {
    return callback(error, body);
  });
};

exports.loadExampleVehicleHistory = function (searchCarRequest, exampleConfig, callback) {
  requestWithJar(exampleConfig.url, function (error, response, body) {
//    console.log(response.headers);

    if (error) {
      logger.error(error);
      return callback(new UnableToGetDataError('Unable to get example vehicle history'));
    }

    if (response.statusCode !== 200) {
      logger.error('Invaid response code: ' + response.statusCode);
      return callback(new UnableToGetDataError('Unable to get example vehicle history'));
    }

    return callback(null, body);
  });
};


exports.loadVehicleHistory = function (formData, formConfig, callback) {
  logger.debug('loadVehicleHistory');

  var opt = {
    url: formData.url,
    method: 'POST',
    form: formData.form,
    followRedirect: true,
    headers: formConfig.headers,
//    gzip: true,
    jar: jar

  };

  requestWithJar(opt, function (error, response, body) {

    if (error) {
      logger.error(error);
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
        return callback(new Error('Bad request'));
//      case 200 :
      default:
        return callback(null, body);
    }

  });
};

exports.getVehicleHistory = function (searchCarRequest, options, callback) {
  var exampleConfig = options.get('example');
  var formConfig = options.get('form');

  if (exports.isExampleVehicle(searchCarRequest, exampleConfig)) {
    return exports.loadExampleVehicleHistory(searchCarRequest, exampleConfig, callback);
  }

  return exports.prepareFormData(searchCarRequest, formConfig, function (err, formData) {
    if (err) {
      logger.error(err);
      return callback(err);
    }

    return exports.loadVehicleHistory(formData, formConfig, callback);
  });
};

module.exports = exports;