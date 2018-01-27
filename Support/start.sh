#!/bin/bash
if [[ $TM_LINTER_DEBUG ]]; then
  "${TM_NODE_BIN}/node" run.js -o "${JSHINTER_OPTIONS_PATH}" -d "${JSHINTER_DISABLE_PLUGINS}" -r tooltip "${TM_FILEPATH}" &>${TM_LINTER_LOG_PATH}/TMLinterStart.log &disown
else
  "${TM_NODE_BIN}/node" run.js -o "${JSHINTER_OPTIONS_PATH}" -d "${JSHINTER_DISABLE_PLUGINS}" -r tooltip "${TM_FILEPATH}" &>/dev/null &disown
fi
exit 0
