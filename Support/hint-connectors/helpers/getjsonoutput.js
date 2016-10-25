/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
var Q = require('q'),
  cp = require('child_process'),
  getJsonOutput;


var getJsonOutput = function (runnable, args, options) {
  var def = Q.defer();
  var dataConcat = '';

  var proc = cp.spawn(runnable, args, options || {});
  try {
    proc.stdout.on('data', function (data) {
      dataConcat = dataConcat + data;
    });

    proc.on('close', function () {
      var jsonData;
      try {
        jsonData = JSON.parse(dataConcat);
      } catch (e) {
        jsonData = [];
      }
      def.resolve(jsonData);
    });

  } catch (e) {
    console.log('error executing getJsonOutput');
    console.log('runnable', runnable);
    console.log('args', args);
    console.log('options', options);
    console.log('proc', proc);
    def.resolve([]);
  }

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
