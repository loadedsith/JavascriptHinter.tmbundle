#!/usr/bin/env bash
#callback.document.did-save
#callback.document.did-open
[[ -f "${HOME}/.nvm/nvm.sh" ]] && . "${HOME}/.nvm/nvm.sh"

# node run.js -o "${JSHINTER_OPTIONS_PATH}" -d "${JSHINTER_DISABLE_PLUGINS}" -r gutter "${TM_FILEPATH}" &>/Users/heathg/Desktop/gutter.log &disown
node run.js -o "${JSHINTER_OPTIONS_PATH}" -d "${JSHINTER_DISABLE_PLUGINS}" -r tooltip "${TM_FILEPATH}" &> ${HOME}/Desktop/JavascriptHinter.log &disown
# node run.js -o "${JSHINTER_OPTIONS_PATH}" -d "${JSHINTER_DISABLE_PLUGINS}" -r tooltip "${TM_FILEPATH}" &>/Users/heathg/Desktop/tooltip.log &disown

exit 0
