'use strict';

/* Middleware allows to export server commonjs modules to client side.
 * using requriejs.
 */

var fs = require('fs'),
	path = require('path');


var replaceDependencyPath = function(text, oldPath, newPath) {
	return text.replace(new RegExp(
		'require\\(\\s*(\'|")(' + oldPath + ')(\'|")\\s*\\)',
		'g'
	), function(str, firstQuote, path, secondQuote) {
		return str.replace(path, newPath);
	})
};

/* Wrap commonjs files into requirejs code */
var amdWrapper = function(text, indent, dependenciesMap) {
	var useStrictRegExp = /^("|')use strict("|');/,
		isGlobalUseStrict = useStrictRegExp.test(text);
	text = text.replace(useStrictRegExp, '');
	if (indent) text = text.replace(/(\r)?\n/g, '\r\n' + indent);
	for (var oldPath in dependenciesMap) {
		var newPath = dependenciesMap[oldPath];
		text = replaceDependencyPath(text, oldPath, newPath);
	}
	// do not wrap if it's already amd module
	if (!/define\(/.test(text)) {
		text = (
			(isGlobalUseStrict ? '\'use strict\';\n' : '\n') +
			'\ndefine(function(require, exports, module) {\n' +
				text +
			'\n});\n'
		);
	}
	return text;
};

/* Params structure:
 * @param {String} params.basePath base output directory for project
 * @param {String} params.baseUrl base url
 * @param {Object} params.modules list of modules with key - url, that you use
 * in requirejs - path: path to module file
 * @param {String} indent indent symbols for wrapped source code (not set
 * by default)
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
			text = amdWrapper(
				fs.readFileSync(modules[key].path + '.js', 'utf-8'),
				params.indent,
				modules[key].dependenciesMap
			);
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
		// remove query string, baseUrl and js extension
		var url = req.url.replace(params.baseUrl, '').replace(/(\.js(\?.*$|$))/, '');
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
					res.end(amdWrapper(text, params.indent, config.dependenciesMap));
				}
			);
		} else {
			next();
		}
	}
};
