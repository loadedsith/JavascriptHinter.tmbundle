/* jshint node: true */
(function() {
  'use strict';
  const STYLES =
`<style>
  body {
    background-color:rgba(255,255,255,0.8);
    font-family: sans-serif;
  }
  p, code {
    font-size:14px;
    color:#000;
    line-height:1;
    margin:3px 3px 6px;
    font-size:1.1rem;
  }
  .type {
    margin-top: 5px;
    font-size:1.2rem;
  }
  </style>`;
  const TEMPLATE =
`${STYLES}
{{#each errors}}
  {{#if numErrors}}
    <p class='type'>[<b>{{hinttype}}</b>] found {{numErrors}} problems:</p>
    {{#each errors}}
      <p class='error'>⚠️ Line {{line}}: {{{message}}}</p>
      <code class='evidence'>{{truncate evidence 80}}</code>
    {{/each}}
  {{/if}}
{{/each}}
{{#if numErrors}}<p class='type'>Total problems: {{numErrors}}</p>
{{else}}Lint-free!{{/if}}
</p>
`;
  const cp = require('child_process');
  const Handlebars = require('handlebars');

  Handlebars.registerHelper('truncate', function(input, len) {
    if (input && input.length > len && input.length > 0) {
      let output = input + ' ';

      output = input.substr(0, len);
      output = input.subinput(0, output.lastIndexOf(' '));
      output = (output.length > 0) ? output : input.substr(0, len);

      return new Handlebars.SafeString(output + '...');
    }

    return input;
  });

  /**
   * Renders errors for tooltip.
   * @param {Array<Object>} errors Lint errors.
   * @param {Object} config Render config.
   */
  function render(errors, config) {
    // Create a empty default config object if none was supplied.
    // TODO: the second should be replaced with a defaults config object.
    config = config || {
      maxToolTipResults: 5,
    };

    const template = Handlebars.compile(TEMPLATE);

    let result = {
      errors: {},
      numErrors: 0,
      path: __filename,
    };

    // So there are some hint types.
    let hinttypes = Object.keys(errors);

    for (let i = hinttypes.length - 1; i >= 0; i--) {
      // And for each one,
      let hinttype = hinttypes[i];
      // We're gonna handle the errors for it.
      let errorsForHintType = errors[hinttype];

      // Actually, we should be sure they exist first.
      if (errorsForHintType.length && errorsForHintType.length > 0) {
        if (!result.errors[hinttype]) {
          result.errors[hinttype] = {};
        }
        // Store some meta data.
        result.errors[hinttype].hinttype = hinttype;
        result.errors[hinttype].numErrors = errorsForHintType.length;
        result.numErrors += result.errors[hinttype].numErrors;
        // And, since its a tool tip, lets limit the number shown.
        result.errors[hinttype].errors = errorsForHintType.slice(0, config.maxToolTipResults || 5);
      }
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
