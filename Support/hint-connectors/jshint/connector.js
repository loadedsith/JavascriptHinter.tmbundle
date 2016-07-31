/**
 * JavascriptHinter - jshint connector
 *
 * Runs the installed jshint version with the specified JSON reporter and parses
 * the output into a JS object
 */
var path = require('path'),
	getJsonOutput = require('../helpers/getjsonoutput');


/**
 * JavaScriptHinter for TextMate plugin for jshint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
	name: 'jshint',
	extensions: ['js'],
	/**
	 * Process the file using jshint
	 * @param {Array} files Array of files to check with the specified linter
	 * @param {Object} options Configuration options for the current linter.
	 * @return {Q.Promise} Returns a promise that is resolved when the output
	 *   is parsed to a JS object
	 */
	process: function (files, options) {
		var reporterDir = path.dirname(__filename),
			fileDir = path.dirname(files[0]),
			args = ['--reporter', reporterDir + '/jshint-json-reporter.js'];

		if (options.args) {
			options.args.forEach(function (arg) {
				args.push(arg);
			});
		}

		args = args.concat(files);
		return getJsonOutput('jshint', args, {cwd: fileDir});
	}
};
