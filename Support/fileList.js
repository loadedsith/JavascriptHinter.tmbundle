
var path = require('path');
var glob = require('glob');

var fileList = function (dir, ignoredFiles) {
  if (!ignoredFiles) {
    ignoredFiles = [];
  }

  var files = glob.sync(dir + "/**/*",
    {
      'ignore': ignoredFiles,
      // 'cwd': dir,
      'nodir': true,
    }
  );

  return files

};

/**
 * Get a list of files in a directory as an array.
 * @param {String} dir Starting directory path to recurse.
 * @param {Array<String>} ignoredFiles Directory names to ignore.
 * @return {Array<String>} File paths under dir.
 */
module.exports = fileList;
