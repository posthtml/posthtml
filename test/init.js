const chai = require('chai')
const { default: chaiAsPromised } = require('chai-as-promised')

chai.should()
chai.use(chaiAsPromised)
