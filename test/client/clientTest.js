const options = require('config');
const rewire = require('rewire');
const client = rewire('../../lib/client/client');
const SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
const vehicleHistoryModel = require('vehicle-history-model');
const ServiceUnavailableError = vehicleHistoryModel.error.ServiceUnavailableError;
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('client test', () => {

  const request = new SearchCarRequestBuilder()
    .withPlate('plate')
    .withVin('vin')
    .withFirstRegistrationDate('date')
    .withCountry('PL')
    .build();

  const requestExample = new SearchCarRequestBuilder()
    .withPlate('BBC12345')
    .withVin('ABC123456789DEF')
    .withFirstRegistrationDate('11.12.2014')
    .withCountry('PL')
    .build();

  it('should be example vehicle', done => {
    const isExample = client.isExampleVehicle(requestExample, options.get('example'));
    expect(isExample).to.be.true;
    done();
  });

  it('should not be example vehicle', done => {
    const isExample = client.isExampleVehicle(request, options.get('example'));
    expect(isExample).to.be.false;
    done();
  });

  it('should build form', done => {
    const body = '<input name="javax.faces.encodedURL" value="javax.faces.encodedURL">' +
      '<input id="javax.faces.ViewState" value="javax.faces.ViewState">';

    const form = client.buildForm(requestExample, body, options.get('form'));

    expect(form).to.not.be.empty;
    expect(form['vehiclehistory:buttonCheck']).to.equal('Check');
    expect(form['vehiclehistory:form']).to.equal('vehiclehistory:form');
    expect(form['javax.faces.encodedURL']).to.equal('javax.faces.encodedURL');
    expect(form['javax.faces.ViewState']).to.equal('javax.faces.ViewState');
    expect(form['vehiclehistory:plate']).to.equal('BBC12345');
    expect(form['vehiclehistory:vin']).to.equal('ABC123456789DEF');
    expect(form['vehiclehistory:date']).to.equal('11.12.2014');

    done();
  });

  it('should failed to build form (throw ServiceUnavailableError)', done => {
    const body = '<input name="notfoundencodedURL" value="notfoundencodedURL">' +
      '<input id="notfoundViewState" value="notfoundViewState">';

    ((() => {
      client.buildForm(requestExample, body, options.get('form'))
    })).should.throw(ServiceUnavailableError);

    done();
  });

  it('should prepare form date', done => {
    const options = {
      get: function (variable) {
        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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

        const error = null;
        const response = null;
        const body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    client.prepareFormData(request, options.get('form'), (err, date) => {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return error on unable to parse url', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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

        const error = null;
        const response = null;
        const body = '<form action="https://invalidurl/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    client.prepareFormData(request, options.get('form'), (err, date) => {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should throw ENOTFOUND when prepare form date', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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

        const error = null;
        const response = null;
        const body = '<input name="notfoundencodedURL" value="notfoundencodedURL">' +
          '<input id="notfoundViewState" value="notfoundViewState">';
        return callback(error, response, body);
      }
    });

    client.prepareFormData(request, options.get('form'), (err, date) => {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should call for example vehicle history', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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
        opts.url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');

        const error = null;
        const response = {statusCode: 200};
        const body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    client.loadExampleVehicleHistory(requestExample, options.get('example'), (err, body) => {
      should.exist(body);
      should.not.exist(err);
      done();
    });
  });

  it('should return error', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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
        opts.url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');

        const error = new Error('error');
        const response = {statusCode: 500};
        const body = '';
        return callback(error, response, body);
      }
    });

    client.loadExampleVehicleHistory(requestExample, options.get('example'), (err, body) => {
      should.exist(err);
      should.not.exist(body);
      done();
    });
  });

  it('should return vehicle example history', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              plate: "BBC12345",
              vin: "ABC123456789DEF",
              firstRegistrationDate: "11.12.2014",
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              postUrlHost: "vehiclehost",
              timeout: 5000,
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
        opts.url.should.equal('https://vehiclehost/vehicle-history/example.xhtml');

        const error = null;
        const response = {statusCode: 200};
        const body = '<form action="https://vehiclehost/strona-glowna?vehicle-history" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
        return callback(error, response, body);
      }
    });

    client.getVehicleHistory(requestExample, options, (err, date) => {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return vehicle history (status 200)', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              plate: "BBC12345",
              vin: "ABC123456789DEF",
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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
        let error = null;
        let response = null;
        let body = '';

        if (opts.url === 'https://vehiclehost' || opts.url === 'https://vehiclehost/strona-glowna?vehicle.xhtml') {
          error = null;
          response = {statusCode: 200};
          body = '<form action="https://vehiclehost/strona-glowna?vehicle.xhtml" class ><input name="javax.faces.encodedURL" value="javax.faces.encodedURL"><input id="javax.faces.ViewState" value="javax.faces.ViewState">';
          return callback(error, response, body);
        }
      }
    });

    client.getVehicleHistory(request, options, (err, date) => {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should return error when call vehicle history (status 400)', done => {
    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              plate: "BBC12345",
              vin: "ABC123456789DEF",
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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
        let error = null;
        let response = null;
        let body = '';

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

    client.getVehicleHistory(request, options, (err, date) => {
      should.exist(err);
      should.not.exist(date);
      done();
    });
  });

  it('should get vehicle history after redirect', done => {

    const options = {
      get: function (variable) {

        switch (variable) {
          case 'example' :
            return {
              timeout: 5000,
              plate: "BBC12345",
              vin: "ABC123456789DEF",
              url: "https://vehiclehost/vehicle-history/example.xhtml"
            };
          case 'form' :
            return {
              url: "https://vehiclehost",
              timeout: 5000,
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
        let error = null;
        let response = null;
        let body = '';

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

    client.getVehicleHistory(request, options, (err, date) => {
      should.exist(date);
      should.not.exist(err);
      done();
    });
  });

  it('should check vehicle history', done => {
    client.__set__({
      requestWithJar: function (opts, callback) {
        should.exist(opts);
        let error = null;
        let response = null;
        let body = '';

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


    client.getVehicleHistory(request, options, (err, body) => {
//      console.log('err', err);
//      console.log('car', car);
//      should.exist(car);
//      should.not.exist(err);
      done();
    });
  });

});
