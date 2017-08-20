const InCache = require('incache');
const defaulty = require('defaulty');
const deleteKey = require('delete-key');

const defaultConfig = {
    life: 0,
    save: true,
    cachedProperty: 'path',
    storeName: 'koa-incache',
    filePath: '.koa-incache',
    onReadCache: ()=>{}
};

/**
 * Cache middleware
 * @param [opts] {Object} configuration options
 * @param [opts.life=0] {number} max age. If 0 not expire
 * @param [opts.save=true] {boolean} if true saves cache in disk
 * @param [opts.cachedProperty='patch'] {string} context property to be cached
 * @param [opts.filePath=.koa-incache] {string} cache file path
 * @param [opts.onReadCache] {Function} function called when a key is read from cache
 * @returns {Function}
 */
module.exports = function (opts = {}) {

    const config = defaulty(opts, defaultConfig);

    config.global = {
        life: config.life
    };

    // One configuration
    const incacheConfig = deleteKey(
        Object.assign({}, config),
        ['life', 'cachedProperty', 'onReadCache']
    );

    //console.log(config);
    //console.log(incacheConfig);

    // Create cache object
    const cache = new InCache(incacheConfig);

    return async function (ctx, next) {

        ctx.cache = cache;

        const key = ctx[defaultConfig.cachedProperty];

        /**
         * Set cache
         * @param value {any} any value to caching
         * @returns {{isNew: boolean, createdOn: (Date|null), updatedOn: (Date|null), value: *}}
         */
        ctx.cached = (value) => {
            return ctx.cache.set(key, value);
        };

        /**
         * Get cached value
         * @type {any|null}
         */
        const cached = ctx.cache.get(key);

        if (cached !== null) {
            config.onReadCache.call(this, key, cached);
            return ctx.body = cached;
        }

        await next();
    }

};