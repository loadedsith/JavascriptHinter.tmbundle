/**
 * JavascriptHinter plugin settings.
 */
module.exports = {
  disabledPlugins: ['eslint'],
  ignored: [
    '.git',
    'node_modules',
    'dist',
    '.DS_store',
    'build',
    '.jshintrc',
    '.jshintignore',
    '.*.min.js',
    '.*.min.css'
  ],
  eslint: {
    args: [
      '--config', '/Users/heathg/.eslintrc'
    ]
  },
  gjslint: {
    args: [
      '--disable', '0005,0001'
    ]
  }
};
