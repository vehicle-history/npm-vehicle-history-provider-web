var meta = require('./lib/meta');
var logger = require('./lib/logger/logger').logger;
var client = require('./lib/client/client');
var parser = require('./lib/parser/parser');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;

var exports = {};

exports.checkVehicleHistory = function (plate, vin, firstRegistrationDate, options, callback) {
  logger.debug('checkCarHistory: plate:' + plate + ', vin:' + vin + ', firstRegistrationDate:' + firstRegistrationDate);

  var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

  client.getVehicleHistory(searchCarRequest, options, function (err, body) {

    if (err) {
      logger.error(err);
      return callback(err);
    }

    return parser.generateReport(body, searchCarRequest, options, callback);
  });
};

/**
 * the version of the library
 * @property VERSION
 * @type String
 * @static
 */
exports.VERSION = meta.VERSION;

module.exports = exports;