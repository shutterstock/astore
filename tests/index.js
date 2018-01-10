const astore = require('../src');

const testDao = {
  getOne: (opts) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          id: opts.id,
          stuff: 'yes',
        })
      }, 500);
    });
  },
  search: (opts) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            id: 123,
            stuff: 'yes',
          },
          {
            id: 456,
            stuff: 'yes',
          },
        ])
      }, 500);
    });
  },
};

describe('Smoke test, single', () => {

  let testStore;
  beforeEach(() => {
    testStore = astore(testDao);
  });

  it('should cache entities', (done) => {
    let now = Date.now();
    testStore.get({ id: 123 }, 'getOne')
      .then(() => {
        console.log('First get: ', (Date.now() - now), 'ms');
        now = Date.now();
      })
      .then(testStore.get.bind(null, { id: 123 }, 'getOne'))
      .then(() => {
        console.log('Second get: ', (Date.now() - now), 'ms');
        now = Date.now();
        done();
      });
  });
});

describe('Smoke test, list', () => {

  let testStore;
  beforeEach(() => {
    testStore = astore(testDao);
  });

  it('should cache entities individually', (done) => {
    let now = Date.now();
    testStore.list({ ids: [123, 456] }, 'getOne')
      .then(() => {
        console.log('First get: ', (Date.now() - now), 'ms');
        now = Date.now();
      })
      .then(testStore.list.bind(null, { ids: [123, 456] }, 'getOne'))
      .then(() => {
        console.log('Second get: ', (Date.now() - now), 'ms');
        now = Date.now();
        done();
      });
  });
});


describe('Smoke test, search', () => {

  let testStore;
  beforeEach(() => {
    testStore = astore(testDao);
  });

  it('should cache entities', (done) => {
    let now = Date.now();
    testStore.search({ }, 'search')
      .then(() => {
        console.log('First get: ', (Date.now() - now), 'ms');
        now = Date.now();
      })
      .then(testStore.get.bind(null, { id: 123 }, 'getOne'))
      .then(() => {
        console.log('Second get: ', (Date.now() - now), 'ms');
        now = Date.now();
        done();
      });
  });
});

describe('Smoke test, direct', () => {

  let testStore;
  beforeEach(() => {
    testStore = astore(testDao);
  });

  it('should cache entities', (done) => {
    let now = Date.now();
    testStore.direct({ id: 123 }, 'getOne')
      .then(() => {
        console.log('First get: ', (Date.now() - now), 'ms');
        now = Date.now();
      })
      .then(testStore.direct.bind(null, { id: 123 }, 'getOne'))
      .then(() => {
        console.log('Second get: ', (Date.now() - now), 'ms');
        now = Date.now();
        done();
      });
  });
});