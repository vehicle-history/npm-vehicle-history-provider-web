var wwwFieldsParser = require('www-fields-parser');
var vehicleHistoryModel = require('vehicle-history-model');
var responseBuilder = vehicleHistoryModel.builder.responseBuilder;
var resolver = vehicleHistoryModel.resolver.resolver;
var VehicleNotFoundError = vehicleHistoryModel.error.VehicleNotFoundError;

var logger = require('../logger/logger').logger;

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var exports = {};

var prepareContent = function (content, prefix) {
  logger.debug('prepareContent using: "%s"', prefix);

  return entities.decode(content.replace(eval('/' + prefix + '/g'), '')).trim();
};

var getResultMap = function (result, searchCarRequest, callback) {

  var map = {};
  var results = result.getResults();
  var emptyValues = true;

  for (var i in results) {
    if (results.hasOwnProperty(i)) {
      var result = results[i];
      map[result.getName()] = result.getValue();

      if (result.getValue()) {
        emptyValues = false;
      }
    }
  }

  if (emptyValues) {
    logger.debug('Empty values for:', searchCarRequest, map);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  if (searchCarRequest) {
    map['plate.value'] = searchCarRequest.plate;
    map['plate.country'] = 'pl';  //TODO
    map['registration.firstDate'] = searchCarRequest.firstRegistrationDate;
  }

  return callback(null, map);
};

exports.generateReport = function (body, searchCarRequest, options, callback) {
  logger.debug('generateReport');

  var notFoundMessage = options.get('form.notFoundMessage');

  var r = new RegExp(notFoundMessage, 'g');

  if (r.test(body)) {
    logger.debug('notFoundMessage exists in body for plate: "%s"', searchCarRequest.plate);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  var prefix = options.get('form.prefix');

  var content = prepareContent(body + '', prefix);

  var parserOptions = {
    fields: options.get('parser.fields')
  };

  wwwFieldsParser.parseContent(content, parserOptions, function (err, result) {

    if (err) {
      logger.error('unable to parse car data: %s', err);
      return callback(err);
    }

    getResultMap(result, searchCarRequest, function (err, map) {
      if (err) {
        logger.error('unable to parse car data:', err);
        return callback(err);
      }

      resolver.resolver(map, searchCarRequest, options, function (err, updatedMap) {
        if (err) {
          logger.error('unable to resolve data: %s', err);
          return callback(err);
        }

        responseBuilder.build(updatedMap, options, function (err, report) {
          if (err) {
            logger.error('unable to generate report by responseBuilder: %s', err);
            return callback(err);
          }

          return callback(err, report);
        });
      });
    });
  });
};

module.exports = exports;