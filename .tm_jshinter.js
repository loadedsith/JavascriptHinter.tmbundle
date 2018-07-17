/**
 * JavascriptHinter plugin settings.
 */
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
      '--config', (process.env.TM_PROJECT_DIRECTORY || process.env.HOME) + '/.eslintrc'
    ]
  },
  gjslint: {
    args: [
      '--disable', '0005,0001'
    ]
  }
};
