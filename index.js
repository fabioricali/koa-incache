const InCache = require('./override/incache');
const defaulty = require('defaulty');
const deleteKey = require('delete-key');

const defaultConfig = {
    life: 0,
    maxAge: 0,
    expires: null,
    save: true,
    cachedProperty: 'originalUrl',
    storeName: 'koa-incache',
    filePath: '.koa-incache',
    onReadCache: ()=>{}
};

/**
 * Cache middleware
 * @param [opts] {Object} configuration options
 * @param [opts.maxAge=0] {number} max age in milliseconds. If 0 not expire
 * @param [opts.life=0] {number} **deprecated:** max age in seconds. If 0 not expire
 * @param [opts.expires] {Date|string} a Date for expiration. (overwrites `opts.maxAge`)
 * @param [opts.save=true] {boolean} if true saves cache in disk
 * @param [opts.cachedProperty='patch'] {string} context property to be cached
 * @param [opts.filePath=.koa-incache] {string} cache file path
 * @param [opts.onReadCache] {Function} function called when a key is read from cache
 * @returns {Function}
 */
module.exports = function (opts = {}) {

    defaulty(opts, defaultConfig);

    /* istanbul ignore if  */
    if(opts.life) {
        opts.maxAge = opts.life * 1000;
    }

    // One configuration
    const incacheConfig = deleteKey.copy(opts,
        ['life','cachedProperty', 'onReadCache']
    );

    // Create cache object
    const cache = new InCache(incacheConfig);

    return async function (ctx, next) {

        const key = ctx[defaultConfig.cachedProperty];

        ctx.cache = cache;

        /**
         * Adds to cache
         * @param value {any} any value to caching
         * @param [opts] {object} InCache options
         * @returns {{isNew: boolean, createdOn: (Date|null), updatedOn: (Date|null), value: *}}
         */
        ctx.cached = (value, opts) => {
            return ctx.cache.set(key, value, opts);
        };

        /**
         * Removes from cache
         */
        ctx.uncache = () => {
            ctx.cache.remove(key);
        };

        /**
         * Get cached value
         * @type {any|null}
         */
        const cached = ctx.cache.get(key);

        if (typeof cached !== 'undefined') {
            opts.onReadCache.call(this, key, cached);
            return ctx.body = cached;
        }

        await next();
    }

};