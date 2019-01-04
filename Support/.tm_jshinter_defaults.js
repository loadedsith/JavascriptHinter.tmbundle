/**
 * JavascriptHinter plugin settings.
 */
const fs = require('fs');

let eslint = {
  plausibleConfigPaths: [
    `${process.env.TM_PROJECT_DIRECTORY}`,
    `${process.env.HOME}`,
    `${process.env.TM_BUNDLE_SUPPORT}`
  ],
  args:[]
};
eslint.plausibleConfigPaths.find((path) => {
  path = `${path}/.eslintrc`;

  if (fs.existsSync(path)) {
    eslint.args.push('--config', path);
    return true;
  }
});

module.exports = {
  disabledPlugins: [
    // 'eslint',
    'eslint_d',
    'gjslint',
    'jscs',
    'jshint'
  ],
  ignored: [
    '.git/**',
    '.gitignore',
    'node_modules/**',
    'dist/**',
    '.DS_store',
    'build/**',
    'Support/node_modules/**',
    '.jshintrc',
    '.jshintignore',
    '.*.min.js',
    '.*.min.css'
  ],
  eslint: {
    args: [
      ...eslint.args
    ]
  },
  gjslint: {
    args: [
      '--disable', '0005,0001'
    ]
  }
};
