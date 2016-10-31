const cp = require('child_process');
const Q = require('q');
const MATE = process.env.TM_MATE;
const gutterImage = 'warning';
const currentFile = process.env.TM_FILEPATH;


/**
 * Returns errors for the current file dropping those without.
 * @param {Array<Object>} errors Error objects.
 * @return {Array<Object>} errors Error objects for the current file.
 */
function getErrorLines(errors) {
  return errors.reduce(function(memo, err) {
    if (err.file === currentFile) {
      memo.push(err.line);
    }

    return memo;
  }, []);
}

/**
 * Clears existing gutter marks and render empty warnings for each error line.
 * Errors are later overwritten with the proper warning message, but
 * this prevents the flickering when clearing existing marks.
 * @param {Array<Object>} errors Error objects.
 * @return {Promise} Promise fulfilled when mate finishes.
 */
function refreshMarks(errors) {
  // clear existing marks in the current file
  const def = Q.defer();
  let args;
  let errorLines = getErrorLines(errors);

  // arguments of gutter setting mate command
  // both --clear-mark and --set-mark commands are present here,
  // this allows clearing existing marks and setting the new ones in a single
  // refresh cycle. see:
  // https://github.com/textmate/textmate/commit/65e72d
  args = [
    '--clear-mark', gutterImage,
    '--line', errorLines.join(','),
    '--set-mark', gutterImage,
    currentFile,
  ];

  // run the cleaner and "empty setter" command
  cp.spawn(MATE, args)
    .on('close', function() {
      def.resolve(errors);
    });

  return def.promise;
}

/**
 * Renders gutter marks with descriptions of the error.
 * @param {Array<Object>} errors Errors.
 */
function renderDescriptions(errors) {
  errors.forEach(function(err) {
    if (err.file === currentFile) {
      cp.spawn(MATE, [
        '--set-mark',
        gutterImage + ':"' + err.message + '"',
        '--line',
        err.line,
        err.file,
      ]);
    }
  });
}



/**
 * Renders errors to the TextMate Gutter via the mark api.
 * @param {Array<Object>} errors An array of error objects.
 */
module.exports = function render(errors) {
  new Q(errors)
    .then(refreshMarks)
    .done(renderDescriptions);
};
