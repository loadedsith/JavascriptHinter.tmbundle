/* jshint node: true */

const fs = require('fs');
const Handlebars = require('handlebars');
const rendererDir = require('path').dirname(__filename);
const content = fs.readFileSync(
    rendererDir + '/default-renderer.html', 'utf8');
const template = Handlebars.compile(content);
const version = require('../../version.json');

Handlebars.registerHelper('truncate', function(input, len) {
  // if (input && input.length > len && input.length > 0) {
  //   let output = input + ' ';
  //
  //   output = input.substr(0, len);
  //   output = input.substr(0, output.lastIndexOf(' '));
  //   output = (output.length > 0) ? output : input.substr(0, len);
  //
  //   return new Handlebars.SafeString(output + '...');
  // }

  return input;
});

module.exports = function render(errorsByHinter) {
  let result = {
    assetPath: rendererDir,
    errors: {},
    numErrors: 0,
    version: version.version,
  };

  for (let hinttype in errorsByHinter) {
    if (errorsByHinter.hasOwnProperty(hinttype)) {
      let errors = errorsByHinter[hinttype];

      if (errors.length) {
        if (!result.errors[hinttype]) {
          result.errors[hinttype] = {};
        }
        result.hinttype = errors[0].hinttype;
        result.path = __filename;
        result.errors[hinttype].numErrors = errors.length;
        result.errors[hinttype].errors = errors;
        result.numErrors += errors.length;
      }
    }
  }

  if (process.env.TM_PROJECT_DIRECTORY) {
    result.project = process.env.TM_PROJECT_DIRECTORY;
    result.displayPath = result.path.replace(process.env.TM_PROJECT_DIRECTORY, '');
  }

  process.stdout.write(template(result));
};
