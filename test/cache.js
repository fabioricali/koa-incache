const cache = require('../');
const be = require('bejs');

describe('cache', function () {
    this.timeout(5000);

    it('should be done with save set to false', function (done) {
        const request = require('request');
        const koa = require('koa');
        const app = new koa();
        let server;

        app.use(cache({
            storeName: 'A',
            save: false
        }));

        app.use(ctx=>{

            const result = 'hello world';
            ctx.cached(result);
            console.log(result);
            ctx.body = result;

            server.close();

            done();
        });

        server = app.listen(3000);
        request('http://localhost:3000');
    });

    it('should be done with save set to true', function (done) {
        const request = require('request');
        const koa = require('koa');
        const app = new koa();
        let server;

        app.use(cache({
            storeName: 'B',
            save: true,
            filePath: __dirname + '/.cache',
            onReadCache: (key, value) => {
                console.log('onReadCache',key, value);

                server.close();

                done();
            }
        }));

        app.use(ctx=>{});

        server = app.listen(3000);
        request('http://localhost:3000');
    });
});