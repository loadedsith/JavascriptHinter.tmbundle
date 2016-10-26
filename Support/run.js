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

  if (!options) {
    throw new Error('Configuration file not found, aborting.');
  }

  return options;
};


/**
 * Connect Plugins to JSON output handling.
 * @param {csp.chan} runnerCh
 * @param {csp.chan} pluginCh
 * @param {Array<string>} files
 */
var pluginsToRunner = function* (runnerCh, pluginCh, files) {
  var options = getOptions();
  options.cwd = cmdOpts.options.directory || '';

  if (files.length === 0) {
    files = fileList(cmdOpts.options.directory, options.ignored);
    if (!files) {
      return;
    }
  }

  if (!files.forEach) {
    files = [files];
  }

  csp.takeAsync(pluginCh, function (plugin) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      for (var i = 0; i < plugin.extensions.length; i++) {
        extension = plugin.extensions[i];
        var fileExt = file.substring(
          file.length,
          (file.length - 1) - (extension.length - 1)
        );

        if (fileExt === extension) {
          csp.putAsync(runnerCh, {
            process: plugin.process,
            arg: [[options.cwd + file], (options[plugin.name] || {}) ]
          });
        }
      }
    }
  });

  csp.go(pluginsLoader.getPlugins,
    [ pluginCh, cmdOpts.options['plugin-path'], options.disabledPlugins ]
  );
};

/**
 * Merge data coming back from hint runner promises
 * @param {js-csp.chan} runnerCh
 * @param {js-csp.chan} resultsCh
 */
var runnerToResults = function* (runnerCh, resultsCh) {
  csp.takeAsync(runnerCh, function(pluginRunner, b, c, s) {
    pluginRunner.process.apply(null, pluginRunner.arg).then(function(results) {
      csp.putAsync(resultsCh, results);
    });
  });
};

/**
 * Render data with the requested renderer
 * @param {js-csp} resultsCh
 * @param {Object} jsonData JSON array of errors to be renedered.
 */
var render = function* (resultsCh, jsonData) {
  var reporter;
  var gutterReporter;
  switch (cmdOpts.options.renderer) {
  case 'tooltip':
    reporter = require('./renderer/tooltip/renderer');
    break;
  default:
    reporter = require('./renderer/default/renderer');
    break;
  }
  csp.takeAsync(resultsCh, function(jsonData) {
    reporter(jsonData);
    // render gutter
    if (process.env.TM_MATE) {
      gutterReporter = require('./renderer/gutter/renderer');
      gutterReporter(jsonData);
    }
  });
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

cmdOpts = getCmdOpts();

var jsonCh = csp.chan();
var pluginCh = csp.chan();
var resultsCh = csp.chan();
var files = cmdOpts.argv;

csp.go(pluginsToRunner, [pluginCh, jsonCh, files]);
csp.go(runnerToResults, [pluginCh, resultsCh]);
csp.go(render, [resultsCh]);
