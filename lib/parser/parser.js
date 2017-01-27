'use strict';

const wwwFieldsParser = require('www-fields-parser');
const vehicleHistoryModel = require('vehicle-history-model');
const resolver = vehicleHistoryModel.resolver.resolver;
const VehicleNotFoundError = vehicleHistoryModel.error.VehicleNotFoundError;

const logger = require('../logger/logger').logger;

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const prepareContent = (content, prefix) => {
  logger.debug('prepareContent using: "%s"', prefix);

  return entities.decode(content.replace(eval('/' + prefix + '/g'), '')).trim();
};

const getResultMap = (result, searchCarRequest, callback) => {

  const map = {};
  const results = result.getResults();
  let emptyValues = true;

  for (const i in results) {
    if (results.hasOwnProperty(i)) {
      const res = results[i];
      map[res.getName()] = res.getValue();

      if (res.getValue()) {
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
    map['plate.country'] = 'pl';
    map['registration.firstDate'] = searchCarRequest.firstRegistrationDate;
  }

  return callback(null, map);
};

const generateReportData = function generateReportData(body, searchCarRequest, options, callback) {
  logger.debug('generateReportData');

  const notFoundMessage = options.get('form.notFoundMessage');

  const r = new RegExp(notFoundMessage, 'g');

  if (r.test(body)) {
    logger.debug('notFoundMessage exists in body for plate: "%s"', searchCarRequest.plate);
    return callback(new VehicleNotFoundError('Vehicle not found'));
  }

  const prefix = options.get('form.prefix');

  const content = prepareContent(body + '', prefix);

  const parserOptions = {
    fields: options.get('parser.fields')
  };

  return wwwFieldsParser.parseContent(content, parserOptions, (err, result) => {

    if (err) {
      logger.error('unable to parse car data: %s', err);
      return callback(err);
    }

    return getResultMap(result, searchCarRequest, (errResultMap, map) => {
      if (errResultMap) {
        logger.error('unable to parse car data:', errResultMap);
        return callback(errResultMap);
      }

      return resolver.resolver(map, searchCarRequest, options, callback);
    });
  });
};

module.exports = {
  generateReportData: generateReportData
};