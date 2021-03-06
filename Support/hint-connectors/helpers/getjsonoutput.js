/* eslint no-console: 0 */

/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
const Q = require('q');
const cp = require('child_process');

/**
 * Gets the json output from the linter.
 * @param {string} runnable - Name of the executable to run
 * @param {Array} args - Command line arguments to pass
 * @param {Object} options - Options to set on process.spawn
 * @return {Q.Promise} Returns a promise that is resolved when executable
 *   finishes running
 */
module.exports = function(runnable, args, options) {
  let def = Q.defer();
  let dataConcat = '';

  if (!options.env) {
    options.env = {
      PATH: `${process.env.PATH}:${process.env.TM_NODE_BIN}`,
    };
  } else if (!options.env.PATH) {
    options.env.PATH = `${process.env.PATH}:${process.env.TM_NODE_BIN}`;
  } else {
    options.env.PATH = `${options.env.PATH}:${process.env.TM_NODE_BIN}`;
  }
  const proc = cp.spawn(runnable, args, options || {});

  proc.on('error', (e) => {
    def.resolve([
      {
        messages: [
          {
            message: `Error executing linter. Is ${runnable} installed?<br>
            <br>
            Linter: ${runnable}<br>
            <br>
            args: ${args}<br>
            <br>
            options: ${JSON.stringify(options)}<br>
            <br>
            ${dataConcat}.<br>
            <br>
            Error: ${e}`.replace('\n', '<br>'),
          },
        ],
      },
    ]);
  });

  proc.stdout.on('data', (data) => {
    dataConcat = dataConcat + data;
  });

  proc.stderr.on('data', (data) => {
    dataConcat = dataConcat + data;
  });

  proc.on('close', () => {
    let jsonData = {};

    try {
      jsonData = JSON.parse(dataConcat);
    } catch (e) {
      jsonData = [{
        messages: [{
          message: `Error rendering json output for ${runnable}. <br>
              Data: <br>
              ${dataConcat}.<br>
              <br>
              args: ${args}<br>
              <br>
              options: ${JSON.stringify(options)}<br>
              <br>
              ${e.stack}`.replace('\n', '<br>'),
        }],
      }];
    }

    def.resolve(jsonData);
  });

  return def.promise;
};
