/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
const Q = require('q');
const cp = require('child_process');

const getJsonOutput = function (runnable, args, options) {
  let def = Q.defer();
  let dataConcat = '';

  var proc = cp.spawn(runnable, args, options || {});

  proc.on('error', function(e) {
    console.log('error executing linter. Is ' + runnable + 'installed?');
    console.log('Linter: ', runnable);
    console.log('args', args);
    console.log('options', options);
    console.log('Error', e);
    def.resolve([]);
  });

  proc.stdout.on('data', function (data) {
    dataConcat = dataConcat + data;
  });

  proc.on('close', function () {
    var jsonData;
    try {
      jsonData = JSON.parse(dataConcat);
    } catch (e) {
      console.log(`Error running ${runnable}: dataConcat: ${dataConcat}.`);
      console.log(`Error running ${runnable}: e: ${e}.`);
      jsonData = [];
    }
    def.resolve(jsonData);
  });

  return def.promise;
};


/**
 * Get the json output from the linter
 * @param {String} runnable - Name of the executable to run
 * @param {Array} args - Command line arguments to pass
 * @param {Object} options - Options to set on process.spawn
 * @return {Q.Promise} Returns a promise that is resolved when executable
 *   finishes running
 */
module.exports = getJsonOutput;
