/* jshint node: true */
(function() {
  'use strict';
  const TEMPLATE =
`<style>body{background-color: rgba(255,255,255,0.8);}p{ color: #000;};
</style>{{#if numErrors}}<p><b>{{hinttype}}</b> found {{numErrors}} problems:</p>
<p>
{{#each errors}}[<b>{{hinttype}}</b>]⚠️ Line {{line}}: {{{message}}}<br/>
{{/each}}
{{else}}Lint-free!{{/if}}
</p>
`
  const Handlebars = require('handlebars');
  const DIALOG = process.env.DIALOG;
  const cp = require('child_process');
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


    const template = Handlebars.compile(TEMPLATE);

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

    cp.exec(`"$DIALOG" tooltip --transparent --html \
        '${template(result)}\' &> /dev/null &`);
  }

  module.exports = function(errors) {
    render(errors);
  };
}());
