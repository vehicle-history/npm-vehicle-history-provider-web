var options = require('config');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var parser = require('../../lib/parser/parser');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('car parser test', function () {

  it('should parser car section v2', function (done) {

    var body = '<html>' +
      '<div id="manufacturer">manufacturer</div>' +
      '<div id="model">model</div>' +
      '<span id="name">name</span>' +
      '<span id="type">van</span>' +
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
      '</html>';

    var plate = 'AB1234';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = 'dd.mm.rrrr';
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    var car = parser.generateReport(body, searchCarRequest, options, function (err, car) {

      car.name.manufacturer.should.equal('manufacturer');
      car.name.name.should.equal('name');
      car.name.model.should.equal('model');

      car.type.type.should.equal('VAN');
      car.type.kind.should.equal('LIMOUSINE');

      car.engine.cubicCapacity.should.equal(1396);
      car.engine.fuel.should.equal('DIESEL');

      car.production.year.should.equal(1988);
      car.policy.status.should.equal('OUTDATED');
      car.registration.status.should.equal('REGISTERED');
      car.inspection.status.should.equal('UPTODATE');
      car.mileage.value.should.equal(111);
      car.mileage.type.should.equal('MILE');

      car.stolen.should.be.true();
      car.plate.should.equal('AB1234');
      car.vin.should.equal('ABC123456789DEF');
      car.firstRegistrationDate.should.equal('dd.mm.rrrr');
      done();
    });

  });
});