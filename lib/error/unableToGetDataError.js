module.exports.UnableToGetDataError = function UnableToGetDataError(message) {
  Error.call(this);
  this.message = message;
  this.code = 'UNABLE_TO_GET_DATA_ERROR';
};