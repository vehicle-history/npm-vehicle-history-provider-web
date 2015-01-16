var options = require('config');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var carParser = require('../../lib/parser/carParser');
var chai = require('chai');
var should = chai.should();

describe('car parser test', function () {

  it('should parser car data', function (done) {

    var map = {
      'name.manufacturer': 'manufacturer',
      'name.name': 'name',
      'name.model': 'model',
      'variant.type': 'van',
      'variant.kind': 'limousine',
      'engine.cc': '1396',
      'engine.fuel': 'diesel',
      'production.year': '1988',
      'policy.status': 'not actual',
      'registration.status': 'registered',
      'inspection.status': 'actual',
      'mileage.value': '111',
      'mileage.type': 'mile',
      'status.stolen': true
    };

    var plate = 'AB1234';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = 'dd.mm.rrrr';
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    var car = carParser.parseCarData(map, searchCarRequest, options, function (err, car) {
      should.exist(car);

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