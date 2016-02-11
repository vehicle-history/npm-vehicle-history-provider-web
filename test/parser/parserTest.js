var options = require('config');
var SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
var parser = require('../../lib/parser/parser');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('parser test', function () {

  it('should generate report', function (done) {

    var body = '<html>' +
      '<div id="manufacturer">AUDI</div>' +
      '<div id="model">model</div>' +
      '<span id="name">name</span>' +
      '<span id="type">car</span>' +
      '<span id="kind">limousine</span>' +
      '<span id="cc">1396</span>' +
      '<span id="fuel">diesel</span>' +
      '<span id="mileageeeee">177000</span>' +
      '<span id="mileagetype"> mile </span>' +
      '<span class="stolen"> stolen!!! </span>' +
      '<p class="year"><span class="strong">1988</span></p>' +
      '<p class="oc"><span class="strong"> not actual </span></p>' +
      '<p class="status"><span class="strong"> registered </span></p>' +
      '<p class="tech"><span class="strong"> actual </span></p>' +
      '<table id="events"><tbody>' +
      '<tr class="event"><td class="date" scope="row"><p>21-11-2011</p></td><td class="type">inspection</td><td class="description"><p class="Task">inspection-description</p></td><td class="owner">XX</td><td class="location">location</td><td class="note">note</td><td class="mileage">177000 KM</td></tr>' +
      '<tr class="event"><td class="date" scope="row"><p>22-11-2011</p></td><td class="type">first-registration</td><td class="description"><p class="Task">first-registration-description</p></td></tr>' +
      '</tbody></table>' +
      '</html>';

    var plate = 'AAE 1111';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '21-11-2011';
    var country = 'PL';

    var searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    parser.generateReportData(body, searchCarRequest, options, function (err, data) {

      should.not.exist(err);
      should.exist(data);
      should.exist(data.events);

      expect(data).to.have.property('name.manufacturer', 'AUDI');
      expect(data).to.have.property('name.name', 'name');
      expect(data).to.have.property('name.model', 'model');


      expect(data).to.have.property('variant.type', 'CAR');
      expect(data).to.have.property('variant.kind', 'LIMOUSINE');

      expect(data).to.have.property('engine.cc', 1396);
      expect(data).to.have.property('engine.fuel', 'DIESEL');

      expect(data).to.have.property('production.year', 1988);

      expect(data).to.have.property('policy.status', 'OUTDATED');

      expect(data).to.have.property('registration.status', 'REGISTERED');
      expect(data).to.have.property('registration.status', 'REGISTERED');
//      expect(data).to.have.property('registration.firstDate', '2011-11-21T00:00:00.000Z');

      expect(data).to.have.property('inspection.status', 'UPTODATE');
      expect(data).to.have.property('mileage.value', 177000);
      expect(data).to.have.property('mileage.type', 'MILE');

      expect(data).to.have.property('status.stolen', true);

      expect(data).to.have.property('plate.value', 'AAE 1111');
      expect(data).to.have.property('plate.country', 'PL');

      expect(data).to.have.property('vin.value', 'ABC123456789DEF');

      var events = data.events;

      expect(events).to.have.deep.property('[0].type', 'INSPECTION');
//      expect(events).to.have.deep.property('[0].createdAt', '2013-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[0].note', 'note');
      expect(events).to.have.deep.property('[0].firstOwner', null);
      expect(events).to.have.deep.property('[0].ownerType', 'UNKNOWN');
      expect(events).to.have.deep.property('[0].location.state', 'location');
      expect(events).to.have.deep.property('[0].location.country', 'PL');
//      expect(events).to.have.deep.property('[0].expireAt', '2013-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[0].mileage', null);

      expect(events).to.have.deep.property('[1].type', 'REGISTRATION');
//      expect(events).to.have.deep.property('[1].createdAt', '2012-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[1].note', null);
      expect(events).to.have.deep.property('[1].firstOwner', null);
      expect(events).to.have.deep.property('[1].ownerType', null);
      expect(events).to.have.deep.property('[1].location', null);
      expect(events).to.have.deep.property('[1].expireAt', null);
      expect(events).to.have.deep.property('[1].abroadRegistration', false);
      expect(events).to.have.deep.property('[1].mileage', null);

      done();
    });
  });

  it('should return error on not found', function (done) {

    var body = '<html>' +
      'vehicle not found' +
      '</html>';

    var plate = 'AB1222';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '21-11-2011';
    var country = 'PL';

    var searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    parser.generateReportData(body, searchCarRequest, options, function (err, report) {

      should.not.exist(report);
      should.exist(err);
      done();
    });
  });
});
