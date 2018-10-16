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
    debug: false,
    onReadCache: ()=>{}
};

/**
 * Cache middleware
 * @param [opts] {Object} configuration options
 * @param [opts.maxAge=0] {number} max age in milliseconds. If 0 not expire
 * @param [opts.life=0] {number} **deprecated:** max age in seconds. If 0 not expire
 * @param [opts.expires] {Date|string} a Date for expiration. (overwrites `opts.maxAge`)
 * @param [opts.save=true] {boolean} if true saves cache in disk
 * @param [opts.debug=false] {boolean} if true show console log
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
        ['life','cachedProperty', 'onReadCache', 'debug']
    );

    // Create cache object
    const cache = new InCache(incacheConfig);
    const waitCacheKey = {};

    function dispatch(ctx, key, cached) {
        debug('read from cache', key);
        opts.onReadCache.call(this, key, cached);
        return ctx.body = cached;
    }

    function debug(...str) {
        if (opts.debug)
            console.log.apply(this, ['[DEBUG]'].concat(str));
    }

    return async function (ctx, next) {

        const key = ctx[defaultConfig.cachedProperty];

        ctx.cache = cache;

        /**
         * Wait cache for all request
         */
        ctx.waitCache = () => {
            waitCacheKey[key] = [];
        };

        ctx.errorWaitCache = (e) => {
            waitCacheKey[key].forEach(item => {
                item.reject(e);
            });
        };

        /**
         * Adds to cache
         * @param value {any} any value to caching
         * @returns {{isNew: boolean, createdOn: (Date|null), updatedOn: (Date|null), value: *}}
         */
        ctx.cached = (value) => {
            const result = ctx.cache.set(key, value);
            if (waitCacheKey[key]) {
                debug('dispatch to queue', key);
                // Dispatch cached value
                waitCacheKey[key].forEach(item => {
                    dispatch(item.ctx, key, value);
                    item.resolve();
                });

                // Delete keu queue
                debug('delete cache queue for', key);
                delete waitCacheKey[key];
            }

            return result;
        };

        /**
         * Removes from cache
         */
        ctx.uncache = () => {
            ctx.cache.remove(key);
        };

        if (waitCacheKey[key]) {
            debug('waiting for', key);
            return new Promise((resolve, reject)=>{
                waitCacheKey[key].push({
                    resolve,
                    reject,
                    ctx,
                    next
                });
            })
        }

        /**
         * Get cached value
         * @type {any|null}
         */
        const cached = ctx.cache.get(key);

        if (typeof cached !== 'undefined') {
            return dispatch(ctx, key, cached);
        }

        return next();
    }

};