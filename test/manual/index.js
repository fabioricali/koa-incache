const koa = require('koa');
const Router = require('koa-router');
const cache = require('../../');
const delay = require('delay');

function boom() {
    throw new Error('Boooom error');
}

const app = new koa();
const router = new Router();

app
    .use(cache({save: false, debug: true}))
    .use(router.routes())
    .use(router.allowedMethods());

router.get('/ciao', async (ctx, next) => {
    console.log('inner ciao')
    try {
        let result = 'hello world';
        ctx.waitCache();
        await delay(5000);
        boom(ctx);
        ctx.body = ctx.cached(result);
    } catch (e) {
        ctx.errorWaitCache(e);
        ctx.body = e.message;
        await next();
    }
});

router.get('/ciao2', async ctx => {
    ctx.waitCache();
    let result = 'hello ciao2';
    ctx.body = ctx.cached(result).value
});

app.listen(4000);

