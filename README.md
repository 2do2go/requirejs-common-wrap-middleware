#RequireJS commonJS wrap middleware

Easiest way to share your modules between server and client side

#Usage
As a middleware:
```js
var app = express.createServer();
app.use(require('requirejs-common-wrap-middleware').wrapper({
  baseUrl: '/js/',
	basePath: 'static/js/',
	modules: {
		'your_module_url': {
			path: 'path_to_module'
		}
	}
}));
```
On production in build script:
```js
require('requirejs-common-wrap-middleware').builder({
  baseUrl: '/js/',
	basePath: 'static/js/',
	modules: {
		'your_module_url': {
			path: 'path_to_module'
		}
	}
});
```
