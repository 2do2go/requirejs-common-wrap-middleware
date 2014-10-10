
# RequireJS commonJS wrap middleware

Easiest way to share your modules between server and client side


## Usage

Sample config

```js
var config = {
  	baseUrl: '/js/',
	basePath: 'static/js/',
	modules: {
		'your/module/url': {
			path: 'path/to/module'
		},
		// example with dependencies mapping
		'your/another/module/url': {
			path: 'path/to/another/module',
			dependenciesMap: {
				'original/dependency/path': 'new/dependency/url'
			}
		}
	}
};
```

As a middleware

```js
var app = express.createServer();
app.use(require('requirejs-common-wrap-middleware').wrapper(config));
```

for production at a build script:

```js
require('requirejs-common-wrap-middleware').builder(config);
```

You can use the same config for wrapper and builder, but
wrapper does not use `basePath` option, in opposite, builder does not use
`baseUrl` option, but use basePath.
