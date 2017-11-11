const rewire = require('rewire');
const SearchCarRequestBuilder = require('vehicle-history-model').model.searchCarRequest.SearchCarRequestBuilder;
const index = require('../index');
const options = require('config');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('index test', () => {
  it('should call checkVehicleHistory ', done => {

    const plate = 'WOR45176';
    const vin = 'ZAR93200000244198';
    const firstRegistrationDate = '30.01.2004';
    const country = 'PL';

    const searchCarRequest = new SearchCarRequestBuilder()
      .withPlate(plate)
      .withVin(vin)
      .withFirstRegistrationDate(firstRegistrationDate)
      .withCountry(country)
      .build();

    index.checkVehicleHistory(searchCarRequest, options, (err, result) => {
      should.not.exist(err);
      should.exist(result);

      expect(result).to.have.property('name.manufacturer', 'ALFA_ROMEO');
      // expect(result).to.have.property('name.name', null);
      expect(result).to.have.property('name.model', '156 1.9 JTD');

      expect(result).to.have.property('variant.type', 'CAR');
      expect(result).to.have.property('variant.kind', 'SEDAN');

      expect(result).to.have.property('engine.cc', 1910);
      expect(result).to.have.property('engine.fuel', 'DIESEL');

      expect(result).to.have.property('production.year', 2004);

      expect(result).to.have.property('policy.status', 'UNKNOWN');
      expect(result).to.have.property('registration.status', 'REGISTERED');
      expect(result).to.have.property('inspection.status', 'UNKNOWN');

      expect(result).to.have.property('mileage.value', 276100);
      expect(result).to.have.property('mileage.type', 'KM');

      expect(result).to.have.property('status.stolen', false);

      expect(result).to.have.property('plate.value', 'WOR45176');
      expect(result).to.have.property('plate.country', 'PL');

      expect(result).to.have.property('vin.value', 'ZAR93200000244198');

      done();
    });
  });
});