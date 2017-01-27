'use strict';

const assert = require('assert-plus');
const request = require('request');
const logger = require('../logger/logger').logger;
const vehicleHistoryModel = require('vehicle-history-model');
const ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const jar = request.jar();
var requestWithJar = request.defaults({jar: jar});

const isExampleVehicle = function isExampleVehicle(searchCarRequest, exampleConfig) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(searchCarRequest.plate, 'searchCarRequest.plate');
  assert.object(exampleConfig, 'exampleConfig');
  assert.string(exampleConfig.plate, 'exampleConfig.plate');

  return searchCarRequest.plate === exampleConfig.plate;
};

const reqex = (body, re) => {
  let res = null;
  while (res = re.exec(body)) {
    return res.length > 0 ? res[1].trim() : null;
  }

  return null;
};

const buildForm = function buildForm(searchCarRequest, body, formConfig) {
  logger.debug('buildForm');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.string(body, 'body');
  assert.object(formConfig, 'formConfig');

  const form = {};

  for (const fieldIndex in formConfig.fields) {
    if (formConfig.fields.hasOwnProperty(fieldIndex)) {
      const field = formConfig.fields[fieldIndex];
      let value = null;

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
        logger.debug(`Failed to parse form param: ${field.fieldName}`);
        throw new ServiceUnavailableError('Unable to prepare data');
      }

      form[field.fieldName] = value;
    }
  }

  return form;
};

const callMainPage = function callMainPage(formConfig, callback) {
  logger.debug('callMainPage');

  assert.object(formConfig, 'formConfig');
  assert.object(formConfig.headers, 'formConfig.headers');
  assert.number(formConfig.timeout, 'formConfig.timeout');

  logger.debug(`callMainPage: ${formConfig.url}`);

  const options = {
    url: formConfig.url,
    rejectUnauthorized: false,
    method: 'GET',
    followRedirect: true,
    headers: formConfig.headers,
    jar: jar,
    timeout: formConfig.timeout
  };

  try {
    return requestWithJar(options, (error, response, body) => {
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

const prepareFormData = function prepareFormData(searchCarRequest, formConfig, callback) {
  logger.debug('prepareFormData');

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(formConfig, 'formConfig');

  callMainPage(formConfig, (error, body) => {

    if (error) {
      logger.error(error);
      return callback(error);
    }

    const postUrlRegex = eval('/action=\"(http.+?' + formConfig.postUrlHost + '\\/strona\-glowna.+?)\" class/g');
    const parsedUrl = reqex(body, postUrlRegex);

    if (!parsedUrl) {
      return callback(new Error('Failed to parse form url'));
    }

    const url = entities.decode(parsedUrl);

    try {
      const form = buildForm(searchCarRequest, body, formConfig);

      return callback(error, {form: form, url: url});
    }
    catch (err) {
      return callback(err);
    }
  });
};

const loadExampleVehicleHistory = function loadExampleVehicleHistory(searchCarRequest, exampleConfig, callback) {

  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(exampleConfig, 'exampleConfig');
  assert.string(exampleConfig.url, 'exampleConfig.url');
  assert.number(exampleConfig.timeout, 'exampleConfig.timeout');

  logger.debug(`loadExampleVehicleHistory: ${exampleConfig.url}`);

  const opt = {
    url: exampleConfig.url,
    rejectUnauthorized: false,
    method: 'GET',
    followRedirect: true,
    jar: jar,
    timeout: exampleConfig.timeout
  };

  try {
    return requestWithJar(opt, (error, {statusCode}, body) => {

      if (error) {
        logger.info('error on loadExampleVehicleHistory: ', error);
        return callback(new ServiceUnavailableError('Unable to get example vehicle history'));
      }

      if (statusCode !== 200) {
        logger.info(`Invaid response code: ${statusCode}`);
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

const loadVehicleHistory = function loadVehicleHistory(formData, formConfig, callback) {
  logger.debug('loadVehicleHistory');

  assert.object(formData, 'formData');
  assert.string(formData.url, 'formData.url');
  assert.object(formConfig, 'formConfig');
  assert.object(formConfig.headers, 'formConfig.headers');
  assert.number(formConfig.timeout, 'formConfig.timeout');

  logger.debug(`loadVehicleHistory: ${formData.url}`);

  const opt = {
    url: formData.url,
    rejectUnauthorized: false,
    method: 'POST',
    form: formData.form,
    followRedirect: true,
    headers: formConfig.headers,
//    gzip: true,
    jar: jar,
    timeout: formConfig.timeout
  };

  try {
    return requestWithJar(opt, (error, {statusCode}, body) => {

      if (error) {
        logger.info('error on loadVehicleHistory: ', error);
        return callback(error);
      }

      switch (statusCode) {
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

const getVehicleHistory = function getVehicleHistory(searchCarRequest, options, callback) {
  assert.object(searchCarRequest, 'searchCarRequest');
  assert.object(options, 'options');

  const exampleConfig = options.get('example');
  const formConfig = options.get('form');

  if (isExampleVehicle(searchCarRequest, exampleConfig)) {
    return loadExampleVehicleHistory(searchCarRequest, exampleConfig, callback);
  }

  return prepareFormData(searchCarRequest, formConfig, (err, formData) => {
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