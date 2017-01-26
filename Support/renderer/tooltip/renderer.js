/* jshint node: true */
(function() {
  'use strict';
  const TEMPLATE =
`{{#if numErrors}}{{hinttype}} found {{numErrors}} problems:

{{#each errors}}[{{hinttype}}] Line {{line}}: {{{message}}}
{{/each}}
{{else}}Lint-free!{{/if}}
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


    process.stdout.write(template(result));
    // var ls = cp.spawn(DIALOG, ['filepanel']);
    // var ls = cp.execFile(DIALOG, ['tooltip']);

      // [
      // 'help',
      // 'tooltip' ,
//       '--text',
//       'foobar'
      // 'tooltip --text foobar',
      // template(result)
    // ].join(' '));
  // )

    // ls.stdout.on('data', (data) => {
   //    process.stdout.write(`stdout: ${data}`);
   //  });
   //
   //  ls.stderr.on('data', (data) => {
   //    process.stdout.write(`stderr: ${data}`);
   //  });
   //
   //  ls.on('close', (code) => {
   //    process.stdout.write(`child process exited with code ${code}`);
   //  });
  }

  module.exports = function(errors) {
    render(errors);
  };
}());
