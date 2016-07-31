var fs = require('fs'),
		path = require('path');

var fileList = function (dir, ignored) {
	return fs.readdirSync(dir).reduce(function (list, file) {
		var name = path.join(dir, file);
		var isDir = fs.statSync(name).isDirectory();

		if (!ignored) {
			ignored = [];
		}

		if (ignored.indexOf(file) !== -1 || ignored.indexOf(path.dirname(file)) !== -1) {
			return [];
		}

		return list.concat(isDir ? fileList(name) : [name]);
	}, []);
};

/**
 * Get a list of files in a directory as an array.
 * @param {String} dir Starting directory path to recurse.
 * @param {String} ignored Directory names to ignore.
 * @return {Array<String>} File paths under dir.
 */
module.exports = fileList;
