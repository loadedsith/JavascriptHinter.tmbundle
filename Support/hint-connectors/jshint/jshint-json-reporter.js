/**
 * Reporter for jshint that outputs a JSON string with the errors
 * @param {Errors[]} errorsCollection
 */
module.exports = {
  reporter: function(errorCollection) {
    let report = errorCollection.map(function(errors) {
      let error = errors.error;

      return {
        column: error.character,
        evidence: error.evidence || '',
        file: errors.file,
        hinttype: 'jshint',
        line: error.line,
        message: error.reason,
        rule: error.code,
      };
    });

    process.stdout.write(JSON.stringify(report) + '\n');
  },
};
