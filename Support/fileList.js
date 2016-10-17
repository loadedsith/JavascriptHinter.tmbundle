var fs = require('fs'),
    path = require('path');

var fileList = function (dir, ignoredFiles) {
  if (!ignoredFiles) {
    ignoredFiles = [];
  }
  return fs.readdirSync(dir).reduce(function (list, file) {
    var name = path.join(dir, file);
    var isDir = fs.statSync(name).isDirectory();
    for (var i = ignoredFiles.length - 1; i >= 0; i--) {
      var ignoredFile = ignoredFiles[i];
      if (name.indexOf(ignoredFile) !== -1) {
        return list;
      }
    }


    return list.concat(isDir ? fileList(name, ignoredFiles) : [name]);
  }, []);
};

/**
 * Get a list of files in a directory as an array.
 * @param {String} dir Starting directory path to recurse.
 * @param {Array<String>} ignoredFiles Directory names to ignore.
 * @return {Array<String>} File paths under dir.
 */
module.exports = fileList;
