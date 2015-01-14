module.exports.UnableToGetDataError = function UnableToGetDataError(message) {
  Error.call(this);
  this.message = message;
};