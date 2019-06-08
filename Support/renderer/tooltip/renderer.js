/* jshint node: true */
{
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
      {{#if @first}}
        {{#if args}}args: {{args}}{{else}}no args{{/if}}
      {{/if}}
      <p class='error'>Line {{line}}: {{{message}}}</p>
      {{#if evidence}}
        <code class='evidence'>{{truncate evidence 80}}</code>
      {{/if}}
    {{/each}}
  {{/if}}
{{/each}}
{{#if numErrors}}
  <p class='type'>Total problems: {{numErrors}}</p>
{{else}}🎉Lint-free!{{/if}}
`;
  const cp = require('child_process');
  const Handlebars = require('handlebars');

  Handlebars.registerHelper('truncate', function(input, len) {
    if (input) {
      input = input.trim();
    }
    if (input && input.length > len && input.length > 0) {
      let output = input + ' ';

      output = input.substr(0, len);
      output = input.substr(0, output.lastIndexOf(' '));
      output = (output.length > 0) ? output : input.substr(0, len);

      return new Handlebars.SafeString(Handlebars.Utils.escapeExpression(output + '…'));
    }

    return input;
  });

  const execGeneric = (error, stdout, stderr) => {
    if (error) {
      console.error(`renderer.js exec error: ${error}`);
      return;
    }
    console.log(`renderer.js stdout: ${stdout}`);
    console.log(`renderer.js stderr: ${stderr}`);
  };

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

    process.env.RESULT = template();
    if (result.numErrors == 0) {
      cp.exec('"$DIALOG" tooltip --transparent --html "$RESULT" &disown', execGeneric);
      if (process.env.TM_LINTER_DEBUG && process.env.TM_LINTER_LOG_PATH) {
        let path = process.env.TM_LINTER_LOG_PATH;
        cp.exec(`date >> ${path}/TMLinterRender.log`);
        cp.exec(`echo "$RESULT" >> ${path}/TMLinterRender.log 2>&1`);
      }
      return;
    }

    if (process.env.TM_PROJECT_DIRECTORY) {
      result.project = process.env.TM_PROJECT_DIRECTORY;
      result.path = result.path.replace(process.env.TM_PROJECT_DIRECTORY, '');
    }

    process.env.RESULT = template(result);

    if (process.env.TM_LINTER_DEBUG && process.env.TM_LINTER_LOG_PATH) {
      let path = process.env.TM_LINTER_LOG_PATH;
      try {
        cp.exec(`date >> ${path}/TMLinterRender.log`);
        cp.exec(`echo "$RESULT" >> ${path}/TMLinterRender.log 2>&1`);
      } catch (e) {
        console.log('failed: e', e);
        cp.exec(`echo \'Failed: ${e}\' >> ${path}/TMLinterRender.log 2>&1`);
      }
    }

    let out = '"$DIALOG" tooltip --transparent --html "$RESULT" &disown';
    cp.exec(out, execGeneric);
  }

  module.exports = function(errors) {
    render(errors);
  };
}
