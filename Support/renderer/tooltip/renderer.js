/* jshint node: true */
(function() {
  'use strict';

  const fs = require('fs');
  const Handlebars = require('handlebars');

  function render(errors, config) {
    // Create a empty default config object if none was supplied.
    // TODO: the second should be replaced with a defaults config object.
    config = config || {
      maxToolTipResults: 10
    };
    var rendererDir = require('path').dirname(__filename);
    var content = fs.readFileSync(rendererDir + '/tooltip-renderer.html', 'utf8');
    var template = Handlebars.compile(content);

    let result = {};
    if (errors.length) {
      result.hinttype = errors[0].hinttype;
      result.numErrors = errors.length;
      result.errors = errors.slice(0, config.maxToolTipResults || 5);
    }

    process.stdout.write(template(result));
  }

  module.exports = function (errors) {
    render(errors);
  };
}());
