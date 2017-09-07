const request = require('supertest');
const koa = require('koa');
const Router = require('koa-router');
const cache = require('../');

describe('cache', function () {
    this.timeout(5000);

    it('should be done with save set to false', function (done) {
        const app = new koa();

        app.use(cache({save: false}));

        app.use(ctx=>{

            const result = 'hello world';
            ctx.cached(result);
            console.log(result);
            ctx.body = result;
            done();
        });

        request(app.listen()).get('/').end();
    });

    it('should be done with save set to true', function (done) {
        const app = new koa();

        app.use(cache({
            save: true,
            filePath: __dirname + '/.cache',
            onReadCache: (key, value) => {
                console.log('onReadCache',key, value);
                done();
            }
        }));

        app.use(ctx=>{});

        request(app.listen()).get('/').end();
    });

    it('should be done without cached', function (done) {
        const app = new koa();
        const router = new Router();

        app.use(cache({
            save: true,
            filePath: __dirname + '/.cache',
            onReadCache: (key, value) => {
                console.log('onReadCache',key, value);
                done('error');
            }
        }));

        router.get('/not/cached', function (ctx, next) {
            if(typeof ctx.cache.get('/not/cached') === 'undefined')
                done();
        });

        app
            .use(router.routes())
            .use(router.allowedMethods());

        request(app.listen()).get('/not/cached').end();
    });

    it('uncache, should be done', function (done) {
        const app = new koa();
        const router = new Router();

        app.use(cache({
            save: true,
            filePath: __dirname + '/.cache',
            onReadCache: (key, value) => {
                console.log('onReadCache',key, value);
                done('error');
            }
        }));

        router.get('/uncache', function (ctx, next) {
            ctx.cached('foo');
            ctx.uncache();
            if(typeof ctx.cache.get('/uncache') === 'undefined')
                done();
        });

        app
            .use(router.routes())
            .use(router.allowedMethods());

        request(app.listen()).get('/uncache').end();
    });
});