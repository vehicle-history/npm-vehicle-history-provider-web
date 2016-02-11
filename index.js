var meta = require('./lib/meta');
var logger = require('./lib/logger/logger').logger;
var client = require('./lib/client/client');
var parser = require('./lib/parser/parser');

var checkVehicleHistory = function checkVehicleHistory(searchCarRequest, options, callback) {
  logger.debug('checkVehicleHistory:', searchCarRequest);

  client.getVehicleHistory(searchCarRequest, options, function (err, body) {

    if (err) {
      logger.error(err);
      return callback(err);
    }

    return parser.generateReportData(body, searchCarRequest, options, callback);
  });
};

module.exports = {
  checkVehicleHistory: checkVehicleHistory,
  VERSION: meta.VERSION
};
