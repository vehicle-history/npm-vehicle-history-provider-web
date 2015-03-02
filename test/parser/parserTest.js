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
      '<span id="mileageeeee">111</span>' +
      '<span id="mileagetype"> mile </span>' +
      '<span class="stolen"> stolen!!! </span>' +
      '<p class="year"><span class="strong">1988</span></p>' +
      '<p class="oc"><span class="strong"> not actual </span></p>' +
      '<p class="status"><span class="strong"> registered </span></p>' +
      '<p class="tech"><span class="strong"> actual </span></p>' +
      '<table id="events"><tbody>' +
      '<tr class="event"><td class="date" scope="row"><p>21-11-2011</p></td><td class="type">inspection</td><td class="description"><p class="Task">description</p></td><td class="owner">XX</td><td class="location">location</td><td class="note">note</td><td class="mileage">177000 KM</td></tr>' +
      '<tr class="event"><td class="date" scope="row"><p>22-11-2011</p></td><td class="type">first-registration</td><td class="description"><p class="Task">description</p></td></tr>' +
      '</tbody></table>' +
      '</html>';

    var plate = 'AB1234';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '21-11-2011';
    var country = 'PL';

    var searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(err);
      should.exist(report);
      should.exist(report.vehicle);
      should.exist(report.events);

      var vehicle = report.vehicle;

      vehicle.name.make.should.equal('AUDI');
      vehicle.name.name.should.equal('name');
      vehicle.name.model.should.equal('model');

      vehicle.type.type.should.equal('CAR');
      vehicle.type.kind.should.equal('LIMOUSINE');

      vehicle.engine.cubicCapacity.should.equal(1396);
      vehicle.engine.fuel.should.equal('DIESEL');

      vehicle.production.year.should.equal(1988);
      vehicle.policy.status.should.equal('OUTDATED');

      vehicle.registration.status.should.equal('REGISTERED');
//      vehicle.registration.firstAt.should.equal('2011-11-21T00:00:00.000Z');

      vehicle.inspection.status.should.equal('UPTODATE');

      vehicle.mileage.value.should.equal(111);
      vehicle.mileage.type.should.equal('MILE');

      vehicle.stolen.should.be.true;

      vehicle.plate.value.should.equal('AB1234');
      vehicle.plate.country.should.equal('PL');

      vehicle.vin.should.equal('ABC123456789DEF');

      var events = report.events;

      expect(events).to.have.deep.property('[0].type', 'PRODUCTION');
//      expect(events).to.have.deep.property('[0].createdAt', '2012-06-13T00:00:00.000Z');
      expect(events).to.have.deep.property('[0].note', null);
      expect(events).to.have.deep.property('[0].firstOwner', null);
      expect(events).to.have.deep.property('[0].ownerType', null);
      expect(events).to.have.deep.property('[0].location', null);
      expect(events).to.have.deep.property('[0].expireAt', null);
      expect(events).to.have.deep.property('[0].abroadRegistration', null);
      expect(events).to.have.deep.property('[0].mileage', null);

      expect(events).to.have.deep.property('[1].type', 'INSPECTON');
//      expect(events).to.have.deep.property('[1].createdAt', '2013-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[1].note', null);
      expect(events).to.have.deep.property('[1].firstOwner', null);
      expect(events).to.have.deep.property('[1].ownerType', null);
      expect(events).to.have.deep.property('[1].location', null);
//      expect(events).to.have.deep.property('[1].expireAt', '2013-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[1].mileage', null);

      expect(events).to.have.deep.property('[2].type', 'REGISTRATION');
//      expect(events).to.have.deep.property('[2].createdAt', '2012-06-17T00:00:00.000Z');
      expect(events).to.have.deep.property('[2].note', null);
      expect(events).to.have.deep.property('[2].firstOwner', null);
      expect(events).to.have.deep.property('[2].ownerType', null);
      expect(events).to.have.deep.property('[2].location', null);
      expect(events).to.have.deep.property('[2].expireAt', null);
      expect(events).to.have.deep.property('[2].abroadRegistration', false);
      expect(events).to.have.deep.property('[2].mileage', null);

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

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(report);
      should.exist(err);
      done();
    });
  });
});
