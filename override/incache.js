const InCache = require('incache');
const helper = require('incache/src/helper');

class Store extends InCache{
    constructor(o) {
        super(o);
    }

    set(key, value, opts = {}) {

        if (!opts.silent && this._emitter.fireTheFirst('beforeSet', key, value) === false) {
            return;
        }

        let record = {
            id: null,
            isNew: true,
            createdOn: null,
            updatedOn: null,
            expiresOn: null,
            value: value
        };

        /**
         * Replace this.DEFAULT_CONFIG with this._opts
         */
        opts = helper.defaults(opts, this._opts);

        if (opts.expires && (helper.is(opts.expires, 'date') || helper.is(opts.expires, 'string'))) {
            record.expiresOn = new Date(opts.expires);
        } else if (opts.maxAge && helper.is(opts.maxAge, 'number')) {
            record.expiresOn = helper.addMSToNow(opts.maxAge);
        } else if (opts.life && helper.is(opts.life, 'number')) {
            helper.deprecated(opts.life, 'life is deprecated use maxAge instead');
            record.expiresOn = helper.addSecondsToNow(opts.life);
        }

        if (this.has(key)) {
            record.isNew = false;
            record.createdOn = this._storage[key].createdOn;
            record.updatedOn = new Date();
            if (!opts.silent) {
                this._onUpdated.call(this, key, record);
                this._emitter.fire('update', key, record);
            }
        } else {
            record.createdOn = new Date();
            if (!opts.silent) {
                this._onCreated.call(this, key, record);
                this._emitter.fire('create', key, record);
            }
        }

        this._storage[key] = record;

        if (!opts.silent) {
            this._emitter.fire('set', key, record);
        }

        return record;
    }
}

module.exports = Store;