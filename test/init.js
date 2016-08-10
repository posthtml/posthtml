require('es6-promise').polyfill()
require('object.assign').shim()

var chai = require('chai')
var chaiSubset = require('chai-subset')
var chaiAsPromised = require('chai-as-promised')

chai.should()
chai.use(chaiSubset)
chai.use(chaiAsPromised)
