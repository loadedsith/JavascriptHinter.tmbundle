/* jshint node: true */
(function() {
  'use strict';

  const fs = require('fs');
  const Handlebars = require('handlebars');

  /**
   * Renders errors for tooltip.
   * @param {Array<Object>} errors Lint errors.
   * @param {Object} config Render config.
   */
  function render(errors, config) {
    // Create a empty default config object if none was supplied.
    // TODO: the second should be replaced with a defaults config object.
    config = config || {
      maxToolTipResults: 10,
    };

    const rendererDir = require('path').dirname(__filename);
    const content = fs.readFileSync(rendererDir +
        '/tooltip-renderer.html', 'utf8');
    const template = Handlebars.compile(content);

    let result = {
      path: __filename,
    };

    if (errors.length) {
      result.hinttype = errors[0].hinttype;
      result.numErrors = errors.length;
      result.errors = errors.slice(0, config.maxToolTipResults || 5);
    }

    if (process.env.TM_PROJECT_DIRECTORY) {
      result.project = process.env.TM_PROJECT_DIRECTORY;
      result.path = result.path.replace(process.env.TM_PROJECT_DIRECTORY, '');
    }

    process.stdout.write(template(result));
  }

  module.exports = function(errors) {
    render(errors);
  };
}());
