module.exports.UnableFormParseError = function UnableFormParseError(message) {
  Error.call(this);
  this.message = message;
  this.code = 'UNABLE_FORM_PARSE_ERROR';
};