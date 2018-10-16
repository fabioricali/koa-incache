const request = require('supertest');
const koa = require('koa');
const Router = require('koa-router');
const cache = require('../');
const delay = require('delay');
const assert = require('assert');

function boom(ctx) {
    const e = new Error('Boooom error');
    ctx.errorWaitCache(e);
    throw e;
}

describe('wait-cache', function () {
    this.timeout(5000);

    it('should be waiting', async function () {
        const app = new koa();
        const agent = request(app.listen());
        const router = new Router();
        let totResponse = 0;
        let totRequest = 0;

        app
            .use(cache({save: false, debug: true}))
            .use(router.routes())
            .use(router.allowedMethods());

        router.get('/ciao', async ctx => {
            totRequest++;

            ctx.waitCache();

            const result = 'hello world';

            await delay(1000);

            ctx.cached(result);

            ctx.body = result;

        });

        for(let i = 0; i < 4; i++)
            agent.get('/ciao')
                .then(res => {
                    totResponse++;
                    console.log(res.text);
                })
                .catch(e => {
                    console.log(e);
                });

        await delay(2500);

        assert.strictEqual(totResponse, 4);
        assert.strictEqual(totRequest, 1);

    });

    it('should be waiting but fails', async function () {
        const app = new koa();
        const agent = request(app.listen());
        const router = new Router();
        let totResponse = 0;
        let totRequest = 0;
        let totError = 0;

        app
            .use(cache({save: false, debug: true}))
            .use(router.routes())
            .use(router.allowedMethods());

        router.get('/ciao', async ctx => {
            totRequest++;

            ctx.waitCache();

            const result = 'hello world';

            await delay(1000);

            boom(ctx);

            ctx.cached(result);

            ctx.body = result;
        });

        for(let i = 0; i < 4; i++)
            agent.get('/ciao')
                .then(res => {
                    totResponse++;
                    console.log(res.text);
                })
                .catch(e => {
                    console.log(e);
                    totError++;
                });

        await delay(2500);

        assert.strictEqual(totResponse, 0);
        assert.strictEqual(totError, 4);
        assert.strictEqual(totRequest, 1);

    });

});