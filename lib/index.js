'use strict';

/* Middleware allows to export server commonjs modules to client side.
 * using requriejs.
 */

var fs = require('fs'),
	path = require('path');

/* Wrap commonjs files into requirejs code */
var amdWrapper = function(text) {
	var useStrictRegExp = /^("|')use strict("|');/,
		isGlobalUseStrict = useStrictRegExp.test(text);
	text = text.replace(useStrictRegExp, '');
	text =
		(isGlobalUseStrict ? '\'use strict\';\n' : '\n') +
		'\ndefine(function(require, exports, module) {\n' +
			text +
		'\n});\n';
	return text;
};

/* Params structure:
 * @param [String] basePath base output directory for project
 * @param [String] baseUrl base url
 * @param [Object] modules list of modules with key - url, that you use in requirejs
 *     - path: path to module file
 */

/* Build project from params */
module.exports.builder = function(params) {
	var modules = params.modules,
		url, text;
	if (!params.basePath) {
		throw new Error('Base path not defined');
	}
	if (modules && isObject(modules)) {
		Object.keys(modules).forEach(function(key) {
			if (!modules[key].path) {
				throw new Error('Path for module ' + key + ' not defined');
			}
			text = amdWrapper(fs.readFileSync(modules[key].path + '.js', 'utf-8'));
			fs.writeFileSync(path.join(params.basePath, key) + '.js', text);
		});
	} else {
		throw new Error('No modules spicified');
	}

	function isObject(value) {
		return Object.prototype.toString.call(value) === '[object Object]';
	}
};

/* Wraps all requested files in params */
module.exports.wrapper = function(params) {
	params = params || {};
	params.baseUrl = params.baseUrl || '';
	return function(req, res, next) {
		// remove query string and js extension
		var url = params.baseUrl + req.url.replace(/(\.js\?.+$)/, '');
		var config = params.modules[url];
		if (config) {
			if (!config.path) {
				next(new Error('Path for module ' + req.url + ' not defined'));
				return;
			}
			fs.readFile(
				config.path + '.js',
				'utf-8',
				function(err, text) {
					if (err) {
						next(err);
						return;
					}
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.end(amdWrapper(text));
				}
			);
		} else {
			next();
		}
	}
};
