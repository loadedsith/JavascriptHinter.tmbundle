JavascriptHinter.tmbundle
===============

This is the Javascript Hinter bundle for TextMate 2. It can provide lint for you as you work in TextMate2 via tooltip or via the HTML output window. It is based on bodnaristvan's JSHint.tmbundle.

It is, as of July 2018 actively used and maintained by Graham P Heath. 

### Installation ###

**Requirements:**

- [Node.js][nodejs]
- [TextMate 2][textmate]

[nodejs]: http://www.nodejs.org
[textmate]: https://github.com/textmate/textmate

**Installation:**

1.  Clone the repository `git clone git://github.com/loadedsith/JavascriptHinter.tmbundle.git`.
2.  Go to the directory `cd JavascriptHinter.tmbundle`.
3.  Run `npm install`
4.  Run `open .` in the same directory to install the bundle
5.  If you run into problems with node not found while running the plugin, check out this comment: https://github.com/loadeddsith/JSHint.tmbundle/issues/

**Linters:**

Linters must be accessible from the command line as it is invoked by TextMate2. Environment variables can be used to ensure the stack is correct.

### Configuration ###

Web output is bound to the `^l` key by default.
Tooltip output is bound to saving the file for js, json, scss, and python.
.tm_jshinter.js can be used to control the individual linters. You may use the bundled command "Open JavascriptHinter config" to create/modify your project's config.

**Environment vars:**

This project looks for a few configurations set by TextMate2's Preferences -> Variables config screen:

`TM_NODE_BIN`
  In your project do `which node`, then set this to that path (but remove /node, eg /Users/[USER]/.nvm/versions/node/v8.5.0/bin)
  This value is automatically appended to $PATH for child scripts. See [ESLint's connector](~/Library/Application Support/TextMate/Pristine Copy/Bundles/JavascriptHinter.tmbundle/Support/hint-connectors/eslint/connector.js) for how this is used exactly.  
`TM_LINTER_LOG_PATH`
  Set to a system path where debug logs should be rendered. Requires TM_LINTER_DEBUG to be truthy (eg TM_LINTER_DEBUG=1)
`TM_LINTER_DEBUG`
  Set to 1 to enable logging. Requires TM_LINTER_LOG_PATH to be set.


### Presentation ###

By default, Textmate2 shows any bundle output in a popup window, but also supports a sidebar as shown in the screenshot above.

To switch to using sidebar..

`defaults write com.macromates.TextMate.preview htmlOutputPlacement right`

Or switch back to window

`defaults write com.macromates.TextMate.preview htmlOutputPlacement window`

