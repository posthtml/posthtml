var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiSubset = require('chai-subset');

chai.should();
chai.use(chaiSubset);
chai.use(chaiAsPromised);
