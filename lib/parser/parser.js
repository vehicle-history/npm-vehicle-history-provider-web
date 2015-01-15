var async = require('async');
var wwwFieldsParser = require('www-fields-parser');
var vehicleHistoryModel = require('vehicle-history-model');
var Report = vehicleHistoryModel.model.Report;

var logger = require('../logger/logger').logger;
var carParser = require('../parser/carParser');

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var exports = {};

var prepareContent = function (content) {
  logger.debug('prepareContent');
  //TODO config
  return entities.decode(content.replace(/_historiapojazduportlet_WAR_historiapojazduportlet_:j_idt6:/g, '')).trim();
};

var getResultMap = function (result) {

  var map = {};
  var results = result.getResults();

  for (var i in results) {
    if (results.hasOwnProperty(i)) {
      var result = results[i];
      map[result.getName()] = result.getValue();
    }
  }

  return map;
};

exports.generateReport = function (body, searchCarRequest, options, callback) {
  logger.debug('generateReport');

  var content = prepareContent(body + '');

  var parserOptions = {
    fields: options.get('parser.fields')
  };

  wwwFieldsParser.parseContent(content, parserOptions, function (err, result) {

    if (err) {
      logger.error('unable to parse car data: %s', err);
      return callback(err);
    }

    var map = getResultMap(result);

    async.series({
        car: function(cb){
          carParser.parseCarData(map, searchCarRequest, options, cb);
        }
      },
      function(err, results) {

        if (err) {
          logger.error('unable to generate report in async call: %s', err);
          return callback(err);
        }

        var car = null;

        if (results.hasOwnProperty('car')) {
          car = results.car;
        }

        var report = new Report(car);
        return callback(err, report);
      });
  });


};

module.exports = exports;