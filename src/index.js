function asyncStore(dao, options = {}) {
  const store = new Map();
  const defaultExpirationTimeout = 1000;
  const defaultMaxLifetimeTimeout = 30000;

  function get(opts, method) {
    const id = opts[options.identifier || 'id'];
    const handle = store.get(id);
    if (handle) return handle.promise.then(lruBump.bind(null, id));
    
    const promise = dao[method](opts).then(lruBump.bind(null, id));

    store.set(id, {
      promise,
      expirationTimer: null,
      created: Date.now(),
    });

    return promise;
  }

  function search(opts, method) {
    return dao[method](opts).then((list) => {
      const created = Date.now();
      list.forEach((entity) => {
        store.set(entity[options.identifier || 'id'], {
          promise: Promise.resolve(entity),
          expirationTimer: setTimeout(lruExpire.bind(null, id), options.expiration || defaultExpirationTimeout),
          created,
        });
      });

      return list;
    });
  }

  function lruBump(id, entity) {
    const handle = store.get(id);
    if (Date.now() - handle.created < defaultMaxLifetimeTimeout - defaultExpirationTimeout) {
      clearTimeout(handle.expirationTimer);
      handle.expirationTimer = setTimeout(lruExpire.bind(null, id), options.expiration || defaultExpirationTimeout);
    }

    return entity;
  }

  function lruExpire(id) {
    store.delete(id);
  }

  return { get, search }
}

module.exports = asyncStore;
