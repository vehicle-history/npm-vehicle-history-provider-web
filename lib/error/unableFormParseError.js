module.exports.UnableFormParseError = function UnableFormParseError(message) {
  Error.call(this);
  this.message = message;
};