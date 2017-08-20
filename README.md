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

### Node.js
```
npm install koa-incache --save
```

# Example

Basic usage

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

## Changelog
You can view the changelog <a target="_blank" href="https://github.com/fabioricali/koa-incache/blob/master/CHANGELOG.md">here</a>

## License
koa-incache is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Authors
<a target="_blank" href="http://rica.li">Fabio Ricali</a>

<a target="_blank" href="https://www.mdslab.org">Davide Polano</a>