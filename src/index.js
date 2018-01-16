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
  const storageKey = options.storageKey || ((id) => `${id}`);
  let enabled = (options.enabled === undefined) ? true : !!options.enabled;

  /**
   * Performs the query directly without delay or cache
   * @param {object} opts The options for the dao
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function direct(opts, method) {
    return dao[method](opts);
  }

  /**
   * Performs a query that returns a single entities to be cached
   * @param {object} opts The options for the dao
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function get(opts, method) {
    if (!enabled) return direct(opts, method);

    const id = storageKey(opts[identifier], opts);
    const handle = store.get(id);
    if (handle) {
      handle.bump = true;
      return handle.promise;
    }
    
    const promise = dao[method](opts)
      .then((entity) => {
        entry.expirationTimer = setTimeout(lruExpire.bind(null, id), expirationStep);
        return entity;
      }, (err) => {
        store.delete(id);
        return Promise.reject(err);
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
   * Performs a search query that returns a list of entities to be cached
   * @param {object} opts The options for the dao
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function search(opts, method) {
    if (!enabled) return direct(opts, method);

    return dao[method](opts).then((list) => {
      const created = Date.now();
      Object.entries(list).forEach((entity) => {
        if (entity[1][identifier]) {
          const key = storageKey(entity[1][identifier], opts);
          store.set(key, {
            bump: false,
            promise: Promise.resolve(entity[1]),
            expirationTimer: setTimeout(lruExpire.bind(null, key), expirationStep),
            created,
          });
        }
      });

      return list;
    });
  }

  /**
   * Performs a list query that returns a list of entities to be cached
   * @param {object} opts The options for the dao - requires an `ids` list property
   * @param {string} method The dao method to call
   * @returns {Promise}
   */
  function getList(opts, method) {
    return Promise.all((opts.ids || []).map(id => {
      const params = Object.assign({}, opts);
      params[identifier] = id;
      return get(params, method);
    }));
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

  /**
   * Checks if a computed key is present in the store
   * @param {string} key The key to search for
   * @returns {boolean} Wether the key is in the store or not 
   */
  function has(key) {
    return store.has(key);
  }

  /**
   * Clears a specified computed key from the store
   * @param {string} key The key to search for
   * @returns {boolean} Wether the key was removed or not 
   */
  function clear(key) {
    return store.delete(key);
  }

  // Store public functions
  return { get, getList, search, direct, has, clear };
}

/* Exports -------------------------------------------------------------------*/

module.exports = asyncStore;
