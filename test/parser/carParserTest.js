var options = require('config');
var carParser = require('../../lib/parser/carParser');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var fs = require('fs');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('car parser test', function () {

  it('should parser car section v2', function (done) {

    var content = '';
    var plate = 'AB1234';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = 'dd.mm.rrrr';
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    var car = carParser.parseCarData(content, searchCarRequest, options, function (err, car) {

//        console.log(err);
//        console.log(car);

//        car.name.manufacturer.should.equal('KIA');
//        car.name.name.should.equal('UB');
//        car.name.model.should.equal('RIO');

//        car.type.type.should.equal('CAR');
//        car.type.kind.should.equal('HATCHBACK');
//
//        car.engine.cubicCapacity.should.equal('1396');
//        car.engine.fuel.should.equal('PETROL');
//
//        car.productionYear.should.equal('2012');
//        car.policy.status.should.equal('UPTODATE');
//        car.registration.status.should.equal('REGISTERED');
//        car.inspection.status.should.equal('UNKNOWN');
//        should.not.exist(car.mileage);
//        car.stolen.should.equal(false);
//        car.plate.should.equal('AB1234');
//        car.vin.should.equal('ABC123456789DEF');
//        car.firstRegistrationDate.should.equal('dd.mm.rrrr');
      done();
    });

  });
});