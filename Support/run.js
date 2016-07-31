var Q = require('q'),
	getopt = require('node-getopt'),
	fileList = require('./fileList'),
	pluginsLoader = require('./plugins-loader'),
	cmdOpts = {},
	getCmdOpts,
	getRunners,
	getJson,
	render;

/**
  * Get configuration file, in this order:
  *   - From the command line flag '-c'
  *   - From the project directory's .tm_jshinter.js file.
  *   - From the current file's directory's .tm_jshinter.js file
  *   - From the plugin (default options).
  * @return {Object}
  */
var getOptions = function () {
	var options,
		optionsPath = cmdOpts.options['options-path'],
		projectOptionsPath = process.env.TM_PROJECT_DIRECTORY + '/.tm_jshinter.js',
		directoryOptionsPath = process.env.TM_DIRECTORY + '/.tm_jshinter.js',
		pluginOptionsPath = __dirname + '/../.tm_jshinter.js';

	try {
		options = require(optionsPath);
		if (cmdOpts.options.debug) {
			console.log('using config in optionsPath');
		}
	} catch (e) {
		try {
			options = require(projectOptionsPath);
			if (cmdOpts.options.debug) {
				console.log('using config in projectOptionsPath');
			}
		} catch (e) {
			try {
				options = require(directoryOptionsPath);
				if (cmdOpts.options.debug) {
					console.log('using config in directoryOptionsPath');
				}
			} catch (e) {
				try {
					options = require(pluginOptionsPath);
					if (cmdOpts.options.debug) {
						console.log('using config in pluginOptionsPath');
					}
				} catch (e) {
					throw new Error('Could not load config file.');
				}
			}
		}
	}
	return options;
};


/**
 * Get the list of hint runner promises.
 * @return {Array<Object>}
 */
var getRunners = function () {
	var plugins,
		options = getOptions(),
		disabledPlugins,
		files = cmdOpts.argv,
		pluginPath = cmdOpts.options['plugin-path'],
		connectors = [];

	if (!options) {
		throw new Error('Configuration file not found, aborting.');
	}

	if (files.length === 0) {
		files = fileList(cmdOpts.options.directory, options.ignored);
	}

	if (!files) {
		return;
	}

	if (!files.forEach) {
		files = [files];
	}

	plugins = pluginsLoader.getPlugins(pluginPath);
	disabledPlugins = options.disabledPlugins || [];

	files.forEach(function (file) {
		plugins.forEach(function (plugin) {
			if (disabledPlugins.indexOf(plugin.name) !== -1) {
				if (cmdOpts.options.debug) {
					console.log('disabled', plugin.name);
				}
				return;
			}

			plugin.extensions.forEach(function (extension) {
				if (file.indexOf(extension) !== -1) {
					connectors.push(plugin.process([file], (options[plugin.name] || {})));
				}
			});
		});
	});

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
		['d', 'disable-plugins=', 'plugins to disable'],
		['o', 'options-path=', 'Path to JSON config'],
		['p', 'plugin-path=', 'plugin path override', './hint-connectors/'],
		['z', 'directory=', 'directory to lint'],
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

