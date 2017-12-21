/**
 * A-Store
 */

/* Methods -------------------------------------------------------------------*/

/**
 * Store constructor
 * @param {object} dao The dao object to wrap
 * @param {object} options The options for the store
 */
function asyncStore(dao, options = {}) {
  const store = new Map();
  const expirationStep = options.timeoutStep || 1000;
  const maxLifetimeTimeout = (options.maxTimeout || 10000) - expirationStep;
  const identifier = options.identifier || 'id';

  /**
   * Performs a query that returns a single entities to be cached
   * @param {object} opts The options for the dao
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function get(opts, method) {
    const id = opts[identifier];
    const handle = store.get(id);
    if (handle) {
      handle.bump = true;
      return handle.promise;
    }
    
    const promise = dao[method](opts)
      .then((entity) => {
        entry.expirationTimer = setTimeout(lruExpire.bind(null, id), expirationStep);
        return entity;
      });

    const entry = {
      bump: false,
      promise,
      expirationTimer: null,
      created: Date.now(),
    };

    store.set(id, entry);

    return promise;
  }

  /**
   * Performs a query that returns a list of entities to be cached
   * @param {object} opts The options for the dao
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function search(opts, method) {
    return dao[method](opts).then((list) => {
      const created = Date.now();
      list.forEach((entity) => {
        store.set(entity[identifier], {
          bump: false,
          promise: Promise.resolve(entity),
          expirationTimer: setTimeout(lruExpire.bind(null, id), expirationStep),
          created,
        });
      });

      return list;
    });
  }

  /**
   * Checks if the id was requested during the caching period, if so, extend it
   * If not, clear it
   * @private
   * @param {*} id The identifier for the promise
   */
  function lruExpire(id) {
    const handle = store.get(id);
    if (handle && handle.bump === true) {
      handle.bump = false;
      if (Date.now() - handle.created < maxLifetimeTimeout) {
        clearTimeout(handle.expirationTimer);
        handle.expirationTimer = setTimeout(lruExpire.bind(null, id), expirationStep);
      }
      else {
        store.delete(id);
      }
    }
    else {
      store.delete(id);
    }
  }

  // Store public functions
  return { get, search }
}

/* Exports -------------------------------------------------------------------*/

module.exports = asyncStore;
