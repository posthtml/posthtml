'use strict'

const chai = require('chai')
const chaiSubset = require('chai-subset')
const chaiAsPromised = require('chai-as-promised')

chai.should()
chai.use(chaiSubset)
chai.use(chaiAsPromised)
