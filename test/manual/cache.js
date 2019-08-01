const koa = require('koa');
const cache = require('../../');

const app = new koa();

app.use(cache({save: false}));

app.use(ctx => {

    const result = 'hello world';
    ctx.cached(result);
    console.log(result);
    ctx.body = result;
    done();
});

app.listen();