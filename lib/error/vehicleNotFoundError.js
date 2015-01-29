module.exports.VehicleNotFoundError = function VehicleNotFoundError(message) {
  Error.call(this);
  this.message = message;
  this.code = 'VEHICLE_NOT_FOUND_ERROR';
};