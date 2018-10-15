<div align="center">
<h1>koa-incache</h1>
Koa cache middleware
<br/><br/>
<a href="https://travis-ci.org/fabioricali/koa-incache" target="_blank"><img src="https://travis-ci.org/fabioricali/koa-incache.svg?branch=master" title="Build Status"/></a>
<a href="https://coveralls.io/github/fabioricali/koa-incache?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/fabioricali/koa-incache/badge.svg?branch=master" title="Coverage Status"/></a>
<a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" title="License: MIT"/></a>
<img src="https://img.shields.io/badge/team-terrons-orange.svg" title="Team Terrons"/>
</div>

## Installation

Koa-incache requires **koa2** and **node v7.6.0 or higher**

```
npm install koa-incache --save
```

# Example

#### Basic usage

```javascript
const cache = require('koa-incache');
const koa = require('koa');
const app = new koa();

app.use(cache());

app.use(ctx=>{
    const result = 'hello world';
    ctx.cached(result);
    ctx.body = result;
});

app.listen(3000);
```

#### Routing
The **cache is made** using `ctx.originalUrl` as key
```javascript
const fs = require('fs');
const cache = require('koa-incache');
const koa = require('koa');
const Router = require('koa-router');
const app = new koa();
const router = new Router();

app.use(cache({
    maxAge: 60000 // 1 minute max age
}));

router.get('/this/is/cached', function (ctx, next) {
    const content = fs.readFileSync('myFile');
    ctx.cached(content);
    ctx.body = content;
});

router.get('/this/is/not/cached', function (ctx, next) {
    const content = fs.readFileSync('myFile');
    ctx.body = content;
});

router.get('/uncache', function (ctx, next) {
    const content = fs.readFileSync('myFile');
    ctx.cached(content);
    
    if(foo)
        ctx.uncache();
    
    ctx.body = content;
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
```

#### Access to InCache instance
From koa context it's possible get InCache by `ctx.cache`

```javascript
router.get('/my/root', function (ctx, next) {
    ctx.cache.set('my key', 'my value');
    //...
});
```

## API context
- `cached` accept an argument that is the content to be stored
- `uncache` remove cache for context root

For more info **about InCache** <a target="_blank" href="https://github.com/fabioricali/incache">click here</a>

## Changelog
You can view the changelog <a target="_blank" href="https://github.com/fabioricali/koa-incache/blob/master/CHANGELOG.md">here</a>

## License
koa-incache is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Authors
<a target="_blank" href="http://rica.li">Fabio Ricali</a>

<a target="_blank" href="https://www.mdslab.org">Davide Polano</a>