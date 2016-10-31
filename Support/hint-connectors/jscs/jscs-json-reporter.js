/**
 * Reports JSON for jscs.
 * @param {Array<Errors>} errorsCollection Array of error Objects.
 */
module.exports = function(errorsCollection) {
  let errorReport = [];

  errorsCollection.forEach(function(errors) {
    if (!errors.isEmpty()) {
      errorReport = errorReport.concat(errors.getErrorList().map(
          function(error) {
            return {
              column: error.column,
              evidence: '',
              file: errors.getFilename(),
              hinttype: 'jscs',
              line: error.line,
              message: error.message,
              rule: error.rule,
            };
          }
        )
      );
    }
  });

  process.stdout.write(JSON.stringify(errorReport) + '\n');
};
