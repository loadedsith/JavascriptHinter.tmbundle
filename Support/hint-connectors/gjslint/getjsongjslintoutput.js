/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
var Q = require('q'),
	cp = require('child_process');


/**
 * Get the json output from the linter.
 *
 * @param {String} runnable - Name of the executable to run
 * @param {Array} args - Command line arguments to pass
 * @param {Object} options - Options to set on process.spawn
 * @return {Q.Promise} Returns a promise that is resolved when executable
 *	 finishes running
 */
module.exports = function (runnable, args, options) {
	var def = Q.defer()
		error = '',
		proc = cp.spawn(runnable, args, options || {}),
		fileRegex = new RegExp(/.*?(\/.*)\ -{5}/),
		errorRegex = new RegExp(/^Line (\d+), E:([^:]+): (.+)$/gm);

	proc.stdout.on('data', function (errorDataChunk) {
		error = error + errorDataChunk;
	});

	proc.on('close', function () {
		var errors = [];

		try {
			var lines = error.match(/^.*((\r\n|\n|\r)|$)/gm);
			for (var line of lines) {
				var file = fileRegex.exec(lines[0])[1];

				var errorObject = {
					file: file,
					hinttype: 'gjslint',
					column: null,
					evidence: ''
				};

				var lineMatches = errorRegex.exec(line);
				if (lineMatches) {
					errorObject.line = parseInt(lineMatches[1]);
					errorObject.message = lineMatches[3];
					errorObject.error = 'E:' + lineMatches[2];
					errors.push(errorObject);
				}
			}
		} catch (e) {
			errors = [];
		}

		def.resolve(errors);
	});

	return def.promise;
};


