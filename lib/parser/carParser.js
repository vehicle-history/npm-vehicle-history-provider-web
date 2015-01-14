var vehicleHistoryModel = require('vehicle-history-model');
var logger = require('../logger/logger').logger;
var CarNameResolver = vehicleHistoryModel.resolver.CarNameResolver;
var CarVariantResolver = vehicleHistoryModel.resolver.CarVariantResolver;
var CarEngineResolver = vehicleHistoryModel.resolver.CarEngineResolver;
var CarProductionResolver = vehicleHistoryModel.resolver.CarProductionResolver;
var CarPolicyResolver = vehicleHistoryModel.resolver.CarPolicyResolver;
var CarRegistrationResolver = vehicleHistoryModel.resolver.CarRegistrationResolver;
var CarInspectionResolver = vehicleHistoryModel.resolver.CarInspectionResolver;
var CarMileageResolver = vehicleHistoryModel.resolver.CarMileageResolver;
var CarStoleResolver = vehicleHistoryModel.resolver.CarStoleResolver;

var Car = vehicleHistoryModel.model.Car;

var carNameResolver = new CarNameResolver();
var carVariantResolver = new CarVariantResolver();
var carEngineResolver = new CarEngineResolver();
var carProductionResolver = new CarProductionResolver();
var carPolicyResolver = new CarPolicyResolver();
var carRegistrationResolver = new CarRegistrationResolver();
var carInspectionResolver = new CarInspectionResolver();
var carMileageResolver = new CarMileageResolver();
var carStoleResolver = new CarStoleResolver();


var exports = {};


exports.parseCarData = function (map, searchCarRequest, options, callback) {
  logger.debug('parseCarData', map, searchCarRequest);

  var nameResponse = carNameResolver.resolve(map, options);
  var typeResponse = carVariantResolver.resolve(map, options);
  var engine = carEngineResolver.resolve(map, options);
  var production = carProductionResolver.resolve(map, options);
  var policy = carPolicyResolver.resolve(map, options);
  var registration = carRegistrationResolver.resolve(map, options);
  var inspection = carInspectionResolver.resolve(map, options);
  var mileage = carMileageResolver.resolve(map, options);
  var stolen = carStoleResolver.resolve(map, options);

  var car = new Car(nameResponse, typeResponse, engine, production, policy, registration, inspection, mileage, stolen, searchCarRequest.getPlate(), searchCarRequest.getVin(), searchCarRequest.getFirstRegistrationDate());
  return callback(null, car);
};

module.exports = exports;