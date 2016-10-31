/* jshint node: true */

const fs = require('fs');
const Handlebars = require('handlebars');
const rendererDir = require('path').dirname(__filename);
const content = fs.readFileSync(
    rendererDir + '/default-renderer.html', 'utf8');
const template = Handlebars.compile(content);
const version = require('../../version.json');

module.exports = function render(errors) {
  let result = {
    assetPath: rendererDir,
    version: version.version,
  };

  if (errors.length) {
    result.project = process.env.TM_PROJECT_DIRECTORY;
    result.hinttype = errors[0].hinttype;
    result.path = __filename;
    result.numErrors = errors.length;
    result.errors = errors.sort('message');
    result.numErrors = errors.length;
  }

  if (process.env.TM_PROJECT_DIRECTORY) {
    result.project = process.env.TM_PROJECT_DIRECTORY;
    result.path = result.path.replace(process.env.TM_PROJECT_DIRECTORY, '');
  }

  process.stdout.write(template(result));
};
