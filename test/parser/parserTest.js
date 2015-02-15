var options = require('config');
var SearchCarRequest = require('vehicle-history-model').model.SearchCarRequest;
var parser = require('../../lib/parser/parser');
var chai = require('chai');
var should = chai.should();

describe('parser test', function () {

  it('should generate report', function (done) {

    var body = '<html>' +
      '<div id="manufacturer">AUDI</div>' +
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
      '<table id="tasks">' +
      '<tr class="task"><td class="name" scope="row"><p>name of task</p></td><td class="image"><img src="/image.png" alt=""/></td><td class="description Task"><p class="Task">Task description</p></td><td class="socket"><p class="cs">Task socket</p></td><td class="file"><p class="fi">Task file</p></td></tr>' +
      '<tr class="task"><td class="name" scope="row"><p>name2 of task</p></td><td class="image"><img src="/image2.png" alt=""/></td><td class="description Task"><p class="Task">Task2 description</p></td><td class="once Task"><p class="oone">Task2 once</p></td></tr>' +
      '</table>' +
      '</html>';

    var plate = 'AB1234';
    var vin = 'ABC123456789DEF';
    var firstRegistrationDate = '21-11-2011';
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(err);
      should.exist(report);
      should.exist(report.car);

      var car = report.car;

      car.name.make.should.equal('AUDI');
      car.name.name.should.equal('name');
      car.name.model.should.equal('model');

      car.type.type.should.equal('VAN');
      car.type.kind.should.equal('LIMOUSINE');

      car.engine.cubicCapacity.should.equal(1396);
      car.engine.fuel.should.equal('DIESEL');

      car.production.year.should.equal(1988);
      car.policy.status.should.equal('OUTDATED');

      car.registration.status.should.equal('REGISTERED');
      car.registration.firstAt.should.equal('2011-11-21T00:00:00.000Z');

      car.inspection.status.should.equal('UPTODATE');

      car.mileage.value.should.equal(111);
      car.mileage.type.should.equal('MILE');

      car.stolen.should.be.true;

      car.plate.value.should.equal('AB1234');
      car.plate.country.should.equal('PL');

      car.vin.should.equal('ABC123456789DEF');

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
    var searchCarRequest = new SearchCarRequest(plate, vin, firstRegistrationDate);

    parser.generateReport(body, searchCarRequest, options, function (err, report) {

      should.not.exist(report);
      should.exist(err);
      done();
    });
  });
});
