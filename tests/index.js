const astore = require('../src');

const testDao = {
  getOne: (opts) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          id: opts.id,
          stuff: 'yes',
        })
      }, 1000);
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
      }, 1000);
    });
  },
};

const testStore = astore(testDao);

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
  });