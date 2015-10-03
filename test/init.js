import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

chai.should();
chai.use(chaiSubset);
chai.use(chaiAsPromised);
