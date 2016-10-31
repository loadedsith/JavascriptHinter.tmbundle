/* eslint no-console: 0 */
/* eslint global-require: 0 */

const getopt = require('node-getopt');
const path = require('path');
const fileList = require('./fileList');
const pluginsLoader = require('./plugins-loader');
const csp = require('js-csp');
let cmdOpts = {};

/**
  * Gets configuration file, in the following order.
  *   - From the command line flag '-c'
  *   - From the project directory's .tm_jshinter.js file.
  *   - From the current file's directory's .tm_jshinter.js file
  *   - From the plugin (default options).
  * @return {Object} Options.
  */
const getOptions = function() {
  const directoryOptionsPath = process.env.TM_DIRECTORY + '/.tm_jshinter.js';
  const optionsPath = cmdOpts.options['options-path'];
  const pluginOptionsPath = __dirname + '/../.tm_jshinter.js';
  const projectOptionsPath = process.env.TM_PROJECT_DIRECTORY +
      '/.tm_jshinter.js';

  let options;

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
 * Runs plugins to the files.
 * @param {csp.chan} pluginCh For putting plugin runners onto.
 * @param {csp.chan} runnerCh For pulling plugins off of.
 * @param {Array<string>} files To be linted.
 * @param {Object} options Various user configurations, including cwd.
 * @param {Object} cmdOpts Command line options, typically coming from plugin
 *     commands.
 */
const pluginsToRunner = function* (
    pluginCh, runnerCh, files, options, cmdOpts) {
  if (files.length === 0) {
    files = fileList(cmdOpts.options.directory, options.ignored);
    if (!files) {
      return;
    }
  }

  if (!files.forEach) {
    files = [files];
  }

  let plugin;

  while ((plugin = yield csp.take(pluginCh))) {
    if (plugin === csp.CLOSED) {
      break;
    }

    for (let file of files) {
      for (let extension of plugin.extensions) {
        if (path.extname(file).toLowerCase() === extension.toLowerCase()) {
          csp.putAsync(runnerCh, {
            arg: [[options.cwd + file], (options[plugin.name] || {})],
            process: plugin.process,
          });
        }
      }
    }
  }
};


/**
 * Merge data coming back from hint runner promises.
 * @param {js-csp.chan} runnerCh Takes pluggin runners.
 * @param {js-csp.chan} resultsCh And puts results.
 */
const runnerToResults = function* (runnerCh, resultsCh) {
  let pluginRunner;

  while ((pluginRunner = yield csp.take(runnerCh))) {
    yield csp.put(resultsCh,
        pluginRunner.process.apply(null, pluginRunner.arg));
  }
};


/**
 * Renders data with the requested renderer.
 * @param {js-csp.Chan} resultsCh Taking from to render.
 * @param {Object} jsonData JSON array of errors to be renedered.
 */
const render = function* (resultsCh) {
  let reporter;
  let gutterReporter;

  switch (cmdOpts.options.renderer) {
    case 'tooltip':
      reporter = require('./renderer/tooltip/renderer');
      break;
    default:
      reporter = require('./renderer/default/renderer');
      break;
  }

  let result;

  while ((result = yield csp.take(resultsCh))) {
    result.then((jsonData) => {
      reporter(jsonData);
      if (process.env.TM_MATE) {
        gutterReporter = require('./renderer/gutter/renderer');
        gutterReporter(jsonData);
      }
    });
  }
};

/**
 * Gets command line params.
 * @return {Object} Command line arguments as configuration object.
 */
const getCmdOpts = function() {
  return getopt.create([
    ['r', 'renderer=ARG', 'renderer to use: default or tooltip'],
    ['d', 'disable-plugins=', 'plugins to disable'],
    ['o', 'options-path=', 'Path to JSON config'],
    ['p', 'plugin-path=', 'plugin path override', './hint-connectors/'],
    ['z', 'directory=', 'directory to lint'],
    ['h', 'help', 'display this help'],
    ['v', 'version', 'show version'],
  ])
  .bindHelp()
  .parseSystem();
};

cmdOpts = getCmdOpts();
let options = getOptions();

options.cwd = '';
if (cmdOpts.options.directory) {
  options.cwd = cmdOpts.options.directory + '/';
}

let runnerCh = csp.chan();
let pluginCh = csp.chan();
let resultsCh = csp.chan();
let files = cmdOpts.argv;

csp.go(pluginsLoader.getPlugins,
  [pluginCh, cmdOpts.options['plugin-path'], options.disabledPlugins]
);
csp.go(pluginsToRunner, [pluginCh, runnerCh, files, options, cmdOpts]);
csp.go(runnerToResults, [runnerCh, resultsCh]);
csp.go(render, [resultsCh]);
