/* eslint no-console: 0 */
/* eslint global-require: 0 */

const getopt = require('node-getopt');
const path = require('path');
const fileList = require('./fileList');
const pluginsLoader = require('./plugins-loader');
const {CLOSED, chan, go, put, putAsync, take} = require('js-csp');

const DIRECTORY_OPTIONS_PATH =
    `${process.env.TM_DIRECTORY}/.tm_jshinter.js`;
const PLUGIN_OPTIONS_PATH =
    `${__dirname}/../.tm_jshinter.js`;
const PROJECT_OPTIONS_PATH =
    `${process.env.TM_PROJECT_DIRECTORY}/.tm_jshinter.js`;

let cmdOpts = {};

let gutterReporter = null;
if (process.env.TM_MATE) {
  gutterReporter = require('./renderer/gutter/renderer');
}

/**
  * Gets configuration file, in the following order.
  *   - From the command line flag '-c'
  *   - From the project directory's .tm_jshinter.js file.
  *   - From the current file's directory's .tm_jshinter.js file
  *   - From the plugin (default options).
  * @return {Object} Options.
  */
const getOptions = function() {
  const optionsPath = cmdOpts.options['options-path'];

  let options;

  try {
    options = require(optionsPath);
    if (cmdOpts.options.debug) {
      console.log('using config in optionsPath');
    }
  } catch (e) {
    try {
      options = require(PROJECT_OPTIONS_PATH);
      if (cmdOpts.options.debug) {
        console.log('using config in PROJECT_OPTIONS_PATH');
      }
    } catch (e) {
      try {
        options = require(DIRECTORY_OPTIONS_PATH);
        if (cmdOpts.options.debug) {
          console.log('using config in DIRECTORY_OPTIONS_PATH');
        }
      } catch (e) {
        try {
          options = require(PLUGIN_OPTIONS_PATH);
          if (cmdOpts.options.debug) {
            console.log('using config in PLUGIN_OPTIONS_PATH');
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
 * @param {chan} pluginCh For putting plugin runners onto.
 * @param {chan} runnerCh For pulling plugins off of.
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

  while ((plugin = yield take(pluginCh))) {
    if (plugin === CLOSED) {
      break;
    }

    for (let file of files) {
      for (let extension of plugin.extensions) {
        if (path.extname(file).toLowerCase() === extension.toLowerCase()) {
          putAsync(runnerCh, {
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
 * @param {js-chan} runnerCh Takes pluggin runners.
 * @param {js-chan} resultsCh And puts results.
 */
const runnerToResults = function* (runnerCh, resultsCh) {
  let pluginRunner;

  while ((pluginRunner = yield take(runnerCh))) {
    yield put(resultsCh,
        pluginRunner.process.apply(null, pluginRunner.arg));
  }
};


/**
 * Renders data with the requested renderer.
 * @param {js-chan} resultsCh Taking from to render.
 * @param {Object} jsonData JSON array of errors to be renedered.
 */
const render = function* (resultsCh) {
  let reporter;
  let results = [];

  switch (cmdOpts.options.renderer) {
    case 'gutter':
      reporter = require('./renderer/gutter/renderer');
      break;
    case 'tooltip':
      reporter = require('./renderer/tooltip/renderer');
      break;
    default:
      reporter = require('./renderer/default/renderer');
      break;
  }
  let result;
  while ((result = yield take(resultsCh))) {
    result.then((jsonData) => {
      results.push(...jsonData)
      reporter(results);

      if (gutterReporter !== null) {
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

let runnerCh = chan();
let pluginCh = chan();
let resultsCh = chan();
let files = cmdOpts.argv;

go(pluginsLoader.getPlugins,
  [pluginCh, cmdOpts.options['plugin-path'], options.disabledPlugins]
);
go(pluginsToRunner, [pluginCh, runnerCh, files, options, cmdOpts]);
go(runnerToResults, [runnerCh, resultsCh]);
go(render, [resultsCh]);
