var Q = require('q');
var getopt = require('node-getopt');
var fileList = require('./fileList');
var pluginsLoader = require('./plugins-loader');
var csp = require('js-csp');
var cmdOpts = {};
var getCmdOpts;
var getRunners;
var getJson;
var render;

var connectorCh = csp.chan();

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
  var plugins;
  var options = getOptions();
  var disabledPlugins;
  var files = cmdOpts.argv;
  var pluginPath = cmdOpts.options['plugin-path'];
  var connectors = [];

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

  // Create a channel for plugins to flow into, looping over the exisiting files
  var ch = csp.chan();
  csp.go(function* (plugin) {
    while (plugin = yield csp.take(ch)) {
    console.log('plugin', plugin);
      if (plugin.closed) {
        break;
      }

      files.forEach(function (file) {
        plugin.extensions.forEach(function (extension) {
          var fileExt = file.substring(
            file.length,
            (file.length - 1) - (extension.length - 1)
           );

          if (fileExt === extension) {
            options.cwd = cmdOpts.options.directory || '';
            csp.putAsync(connectorCh, plugin.process.call(this,
                [options.cwd + file], (options[plugin.name] || {})
              )
            );
          }
        });
      });
    }
  });

  csp.go(pluginsLoader.getPlugins, [ch, pluginPath, options.disabledPlugins]);
  console.log('Legendary Red Housekeeper halfback red kangaroo');

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

  Q.fcall(getRunners);
  csp.takeAsync(connectorCh, function(pluginRunner) {
    console.log('pluginRunner()', pluginRunner.then(getJson).then(function(a,b,c) {
      console.log('a, b, c', a, b, c);
    }));
  })
    // .then(getJson)
    // .then(getJson)
  //   .then(render)
  //   .done();
}());

