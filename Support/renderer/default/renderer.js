/* jshint node: true */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var Handlebars = require('handlebars');

  module.exports = function render(errors) {
    var rendererDir = require('path').dirname(__filename),
      content = fs.readFileSync(rendererDir + '/default-renderer.html', 'utf8'),
      template = Handlebars.compile(content),
      version = require('../../version.json');

    let result = {
      assetPath: rendererDir,
      version: version.version,
    }

    if (errors.length) {
      result.hinttype = errors[0].hinttype;
      result.path = __filename;
      result.numErrors = errors.length;
      result.errors = errors;
      result.numErrors = errors.length;
    }

    if (process.env.TM_PROJECT_DIRECTORY) {
      result.project = process.env.TM_PROJECT_DIRECTORY;
      result.path = result.path.replace(process.env.TM_PROJECT_DIRECTORY, '');
    }

    process.stdout.write(template(result));
  }

}());
