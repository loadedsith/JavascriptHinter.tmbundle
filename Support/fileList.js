let glob = require('glob');

/**
 * Get a list of files in a directory as an array.
 * @param {string} dir Starting directory path to recurse.
 * @param {Array<string>} ignoredFiles Directory names to ignore.
 * @return {Array<string>} File paths under dir.
 */
module.exports = function(dir, ignoredFiles) {
  if (!ignoredFiles) {
    ignoredFiles = [];
  }

  let files = glob.sync('**',
    {
      'cwd': dir,
      'ignore': ignoredFiles,
      'nodir': true,
    }
  );

  return files;
};

