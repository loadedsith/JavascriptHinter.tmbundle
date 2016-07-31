var Q = require('q'),
	getopt = require('node-getopt'),
	cmdOpts = {},
	getCmdOpts, getRunners, getJson, render;

/**
 * Get the list of hint runner promises.
 * @return {Array<>}
 */
getRunners = function () {
	var jshintConnector = require('./hint-connectors/jshint/connector'),
		jscsConnector = require('./hint-connectors/jscs/connector'),
		scsslintConnector = require('./hint-connectors/scsslint/connector'),
		eslintConnector = require('./hint-connectors/eslint/connector'),
		gjslintConnector = require('./hint-connectors/gjslint/connector'),
		files = cmdOpts.argv,
		connectors;

	if (files[0].indexOf('.scss') !== -1) {
		connectors = [scsslintConnector.process(files)];
	} else {
		connectors = [
			jshintConnector.process(files),
			eslintConnector.process(files),
			jscsConnector.process(files),
			gjslintConnector.process(files)
		];
	}
	return connectors;
};

/**
 * Merge data coming back from hint runner promises
 * @param {Array<Object>} runners Output from runners, to be converted to JSON.
 * @return {Q.Promise} Returns a promise that is resolved when the output is
 *   gathered.
 */
var getJson = function (runners) {
	var def = Q.defer();
	Q.spread(runners, function () {
		var data = [];
		Array.prototype.slice.call(arguments).forEach(function (retval) {
			data = data.concat(retval);
		});
		def.resolve(data);
	});
	return def.promise;
};

/**
 * Render data with the requested renderer
 * @param {Object} jsonData JSON array of errors to be renedered.
 */
var render = function (jsonData) {
	var reporter, gutterReporter;
	switch (cmdOpts.options.renderer) {
	case 'tooltip':
		reporter = require('./renderer/tooltip/renderer');
		break;
	default:
		reporter = require('./renderer/default/renderer');
		break;
	}
	reporter(jsonData);

	// render gutter
	if (process.env.TM_MATE) {
		gutterReporter = require('./renderer/gutter/renderer');
		gutterReporter(jsonData);
	}
};

/**
 * Get command line params
 * @return {Object} Command line arguments as configuration object.
 */
var getCmdOpts = function () {
	return getopt.create([
		['r', 'renderer=ARG', 'renderer to use: default or tooltip'],
		['h', 'help', 'display this help'],
		['v', 'version', 'show version']
	])
	.bindHelp()
	.parseSystem();
};


/**
 * Run the process
 */
(function () {

	cmdOpts = getCmdOpts();

	Q.fcall(getRunners)
		.then(getJson)
		.then(render)
		.done();
}());
