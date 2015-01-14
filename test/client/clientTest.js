var options = require('config');
var rewire = require('rewire');
var client = rewire('../../lib/client/client');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var UnableFormParseError = require('../../lib/error/unableFormParseError').UnableFormParseError;
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;


var testConfig = {
  "parser": {
    "fields": [
      {
        "name": "name.manufacturer",
        "stages": [
          {
            "type": "selector",
            "selector": "#manufacturer"
          }
        ]
      },
      {
        "name": "name.name",
        "stages": [
          {
            "type": "selector",
            "selector": "#name"
          }
        ]
      },
      {
        "name": "name.model",
        "stages": [
          {
            "type": "selector",
            "selector": "#model"
          }
        ]
      }
    ]
  },
  example: {
    plate: "AB1234",
    vin: "ABC123456789DEF",
    firstRegistrationDate: "11.12.2014",
    url: "https://vehiclehost/vehicle-history.xhtml"
  },
  form: {
    url: "https://vehiclehost",
    postUrlHost: "vehiclehost",
    postUrlRegex: "/action=\"(https\:\/\/vehiclehost\/strona\-glowna.+?)\" class/g",
    headers: {
      'Content-Type': 'application/xhtml+xml',
      'User-Agent': "Mozilla/5.0",
      'Origin': "https://vehiclehost",
      'Referer': "https://vehiclehost"
    },
    fields: [
      {
        fieldName: "vehiclehistory:buttonCheck",
        fieldRegex: null,
        fieldDefaultValue: "Check",
        searchCarRequestField: null
      },
      {
        fieldName: "vehiclehistory:form",
        fieldRegex: null,
        fieldDefaultValue: "vehiclehistory:form",
        searchCarRequestField: null
      },
      {
        fieldName: "javax.faces.encodedURL",
        fieldRegex: "/name=\"javax.faces.encodedURL\" value=\"(.+?)\"/g",
        fieldDefaultValue: null,
        searchCarRequestField: null
      },
      {
        fieldName: "javax.faces.ViewState",
        fieldRegex: "/id=\"javax.faces.ViewState\" value=\"(.+?)\"/g",
        fieldDefaultValue: null,
        searchCarRequestField: null
      },
      {
        fieldName: "vehiclehistory:plate",
        fieldRegex: null,
        fieldDefaultValue: null,
        searchCarRequestField: "plate"
      },
      {
        fieldName: "vehiclehistory:vin",
        fieldRegex: null,
        fieldDefaultValue: null,
        searchCarRequestField: "vin"
      },
      {
        fieldName: "vehiclehistory:date",
        fieldRegex: null,
        fieldDefaultValue: null,
        searchCarRequestField: "firstRegistrationDate"
      }
    ]
  }
};

options.util.extendDeep(options, testConfig);

describe('client test', function () {


  it('should be example vehicle', function (done) {
    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    var isExample = client.isExampleVehicle(request, options.get('example'));
    expect(isExample).to.be.true();
    done();
  });

  it('should not be example vehicle', function (done) {
    var request = new SearchCarRequest('www', 'ccc', '111.mm.rrrr');
    var isExample = client.isExampleVehicle(request, options.get('example'));
    expect(isExample).to.be.false();
    done();
  });

  it('should build form', function (done) {
    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    var body = '<input name="javax.faces.encodedURL" value="javax.faces.encodedURL">' +
      '<input id="javax.faces.ViewState" value="javax.faces.ViewState">';

    var form = client.buildForm(request, body, options.get('form'));

    expect(form).to.not.be.empty;
    expect(form['vehiclehistory:buttonCheck']).to.equal('Check');
    expect(form['vehiclehistory:form']).to.equal('vehiclehistory:form');
    expect(form['javax.faces.encodedURL']).to.equal('javax.faces.encodedURL');
    expect(form['javax.faces.ViewState']).to.equal('javax.faces.ViewState');
    expect(form['vehiclehistory:plate']).to.equal('AB1234');
    expect(form['vehiclehistory:vin']).to.equal('ABC123456789DEF');
    expect(form['vehiclehistory:date']).to.equal('11.12.2014');

    done();
  });

  it('should failed to build form (throw UnableFormParseError)', function (done) {
    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    var body = '<input name="notfoundencodedURL" value="notfoundencodedURL">' +
      '<input id="notfoundViewState" value="notfoundViewState">';

    (function () {
      client.buildForm(request, body, options.get('form'))
    }).should.throw(UnableFormParseError);

    done();
  });

  it('should prepare form date', function (done) {
    var options = {
      get: function (variable) {
        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            }
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        opts.url.should.equal('https://vehiclehost');

        var error = null;
        var response = null;
        var body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    var request = new SearchCarRequest('www', 'ccc', '111.mm.rrrr');
    client.prepareFormData(request, options.get('form'), function (err, date) {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return error on unable to parse url', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        opts.url.should.equal('https://vehiclehost');

        var error = null;
        var response = null;
        var body = '<form action="https://invalidurl/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    var request = new SearchCarRequest('www', 'ccc', '111.mm.rrrr');
    client.prepareFormData(request, options.get('form'), function (err, date) {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should throw ENOTFOUND when prepare form date', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        opts.url.should.equal('https://vehiclehost');

        var error = null;
        var response = null;
        var body = '<input name="notfoundencodedURL" value="notfoundencodedURL">' +
          '<input id="notfoundViewState" value="notfoundViewState">';
        return callback(error, response, body);
      }
    });

    var req = new SearchCarRequest('www', 'ccc', '111.mm.rrrr');
    client.prepareFormData(req, options.get('form'), function (err, date) {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should call for example vehicle history', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({

      requestWithJar: function (url, callback) {
        url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');

        var error = null;
        var response = {statusCode: 200};
        var body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    client.loadExampleVehicleHistory(request, options.get('example'), function (err, body) {
      should.exist(body);
      should.not.exist(err);
      done();
    });
  });

  it('should return error', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (url, callback) {
        url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');

        var error = new Error('error');
        var response = {statusCode: 500};
        var body = '';
        return callback(error, response, body);
      }
    });

    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    client.loadExampleVehicleHistory(request, options.get('example'), function (err, body) {
      should.exist(err);
      should.not.exist(body);
      done();
    });
  });

  it('should return vehicle example history', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              plate: "AB1234",
              vin: "ABC123456789DEF",
              firstRegistrationDate: "11.12.2014",
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (url, callback) {
        url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');
        var error = null;
        var response = {statusCode: 200};
        var body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    var request = new SearchCarRequest('AB1234', 'ABC123456789DEF', '11.12.2014');
    client.getVehicleHistory(request, options, function (err, date) {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return vehicle history (status 200)', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        var error = null;
        var response = null;
        var body = '';

        if (opts.url === 'https://vehiclehost' || opts.url === 'https://vehiclehost/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {statusCode: 200};
          body = '<form action="https://vehiclehost/strona-glowna?vehicle.xhtml" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
          return callback(error, response, body);
        }
      }
    });

    var request = new SearchCarRequest('plate', 'vin', 'date');
    client.getVehicleHistory(request, options, function (err, date) {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return error when call vehicle history (status 400)', function (done) {
    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        var error = null;
        var response = null;
        var body = '';

        if (opts.url === 'https://vehiclehost') {
          error = null;
          response = {statusCode: 200};
          body = '<form action="https://vehiclehost/strona-glowna?vehicle.xhtml" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
          return callback(error, response, body);
        }
        else if (opts.url === 'https://vehiclehost/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {statusCode: 400};
          body = 'body';
          return callback(error, response, body);
        }
      }
    });

    var request = new SearchCarRequest('plate', 'vin', 'date');
    client.getVehicleHistory(request, options, function (err, date) {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should get vehicle history after redirect', function (done) {

    var options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              headers: {
                'Content-Type': 'application/xhtml+xml',
                'User-Agent': "Mozilla/5.0",
                'Origin': "https://vehiclehost",
                'Referer': "https://vehiclehost"
              },
              fields: [
              ]
            };
        }
      }
    };

    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        var error = null;
        var response = null;
        var body = '';

        if (opts.url === 'https://vehiclehost') {
          error = null;
          response = {statusCode: 200};
          body = '<form action="https://vehiclehost/strona-glowna?vehicle.xhtml" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
          return callback(error, response, body);
        }
        else if (opts.url === 'https://vehiclehost/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {
            statusCode: 302,
            headers: {
              location: 'https://redirect/strona-glowna?vehicle.xhtml'
            }
          };
          body = 'body';
          return callback(error, response, body);
        }
        else if (opts.url === 'https://redirect/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {statusCode: 200};
          body = 'body';
          return callback(error, response, body);
        }
      }
    });

    var request = new SearchCarRequest('plate', 'vin', 'date');
    client.getVehicleHistory(request, options, function (err, date) {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should check vehicle history', function (done) {
    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        var error = null;
        var response = null;
        var body = '';

        if (opts.url === 'https://vehiclehost') {
          error = null;
          response = {statusCode: 200};
          body = '<form action="https://vehiclehost/strona-glowna?vehicle.xhtml" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
          return callback(error, response, body);
        }
        else if (opts.url === 'https://vehiclehost/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {
            statusCode: 302,
            headers: {
              location: 'https://redirect/strona-glowna?vehicle.xhtml'
            }
          };
          body = 'body';
          return callback(error, response, body);
        }
        else if (opts.url === 'https://redirect/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {statusCode: 200};
          body = '<div id="manufacturer">manufacturer</div><div id="name">name</div><div id="model">model</div>';
          return callback(error, response, body);
        }
      }
    });

    var request = new SearchCarRequest('plate', 'vin', 'date');
    client.checkVehicleHistory(request, options, function (err, body) {
//      console.log('err', err);
//      console.log('car', car);
//      should.exist(car);
//      should.not.exist(err);
      done();
    });
  });

});
