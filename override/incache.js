const InCache = require('incache');
const Flak = require('flak');
const helper = require('incache/src/helper');

class Store extends InCache{
    constructor(opts) {
        super(opts);

        this._emitter = new Flak();

        this._timerExpiryCheck = null;

        /**
         * Global key
         * @type {string}
         * @ignore
         */
        this.GLOBAL_KEY = '___InCache___storage___global___key___';

        /**
         * InCache default configuration
         * @ignore
         * @type {{storeName: string, save: boolean, filePath: string, maxAge: number, expires: null, silent: boolean, share: boolean, global: {silent: boolean, life: number}}}
         */
        this.DEFAULT_CONFIG = {
            storeName: '',
            save: false,
            filePath: '.incache',
            maxAge: 0,
            expires: null,
            silent: false,
            share: false,
            autoRemovePeriod: 0,
            nullIfNotFound: false
        };

        // Defines callback private
        this._onRemoved = () => {
        };
        this._onCreated = () => {
        };
        this._onUpdated = () => {
        };

        if (helper.isServer()) {
            process.stdin.resume();
            process.on('exit', () => {
                this._write();
                process.exit(1);
            });
            process.on('SIGINT', () => {
                this._write();
                process.exit(1);
            });
        }

        this.setConfig(opts);
    }

    set(key, value, opts = {}) {

        if (!opts.silent && this._emitter.fireTheFirst('beforeSet', key, value) === false) {
            return;
        }

        let record = {
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