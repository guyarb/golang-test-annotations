module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 456:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(127);
const lineReader = __webpack_require__(631);

try {
	const testResultsPath = core.getInput('test-results');

	var obj = new Object();
	var lr = new lineReader(testResultsPath);
	lr.on('line', function(line) {
		const currentLine = JSON.parse(line);
		var testName = currentLine.Test;
		if (typeof testName === "undefined") {
			return;
		}

		var output = currentLine.Output;
		if (typeof output === "undefined") {
			return;
		}
		output = output.replace("\n", "%0A").replace("\r", "%0D")
		// Removing the github.com/owner/reponame
		var packageName = currentLine.Package.split("/").slice(3).join("/");
		var newEntry = packageName + "/" + testName;
		if (!obj.hasOwnProperty(newEntry)) {
			obj[newEntry] = output;
		} else {
			obj[newEntry] += output;
		}
	});
	lr.on('end', function() {
		for (const [key, value] of Object.entries(obj)) {
			if (value.includes("FAIL") && value.includes("_test.go")) {
				const parts = value.split("%0A")[1].trim().split(":");
				const file = key.split("/").slice(0, -1).join("/") + "/" + parts[0];
				const lineNumber = parts[1];
				core.info(`::error file=${file},line=${lineNumber}::${value}`)
			}
		}
	});
} catch (error) {
	core.setFailed(error.message);
}


/***/ }),

/***/ 604:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(87));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 127:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(604);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 631:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 * Line By Line
 *
 * A NodeJS module that helps you reading large text files, line by line,
 * without buffering the files into memory.
 *
 * Copyright (c) 2012 Markus von der Wehd <mvdw@mwin.de>
 * MIT License, see LICENSE.txt, see http://www.opensource.org/licenses/mit-license.php
 */

var stream = __webpack_require__(413);
var StringDecoder = __webpack_require__(304).StringDecoder;
var path = __webpack_require__(622);
var fs = __webpack_require__(747);
var events = __webpack_require__(614);

// let's make sure we have a setImmediate function (node.js <0.10)
if (typeof global.setImmediate == 'undefined') { setImmediate = process.nextTick;}

var LineByLineReader = function (filepath, options) {
	var self = this;

	this._encoding = options && options.encoding || 'utf8';
	if (filepath instanceof stream.Readable) {
		this._readStream = filepath;
	}
	else {
		this._readStream = null;
		this._filepath = path.normalize(filepath);
		this._streamOptions = { encoding: this._encoding };

		if (options && options.start) {
			this._streamOptions.start = options.start;
		}

		if (options && options.end) {
			this._streamOptions.end = options.end;
		}
	}
	this._skipEmptyLines = options && options.skipEmptyLines || false;

	this._lines = [];
	this._lineFragment = '';
	this._paused = false;
	this._end = false;
	this._ended = false;
	this.decoder = new StringDecoder(this._encoding);

	events.EventEmitter.call(this);

	setImmediate(function () {
		self._initStream();
	});
};

LineByLineReader.prototype = Object.create(events.EventEmitter.prototype, {
	constructor: {
		value: LineByLineReader,
		enumerable: false
	}
});

LineByLineReader.prototype._initStream = function () {
	var self = this,
		readStream = this._readStream ? this._readStream :
			fs.createReadStream(this._filepath, this._streamOptions);

	readStream.on('error', function (err) {
		self.emit('error', err);
	});

	readStream.on('open', function () {
		self.emit('open');
	});

	readStream.on('data', function (data) {
		self._readStream.pause();
		var dataAsString = data;
		if (data instanceof Buffer) {
			dataAsString = self.decoder.write(data);
		}
		self._lines = self._lines.concat(dataAsString.split(/(?:\n|\r\n|\r)/g));

		self._lines[0] = self._lineFragment + self._lines[0];
		self._lineFragment = self._lines.pop() || '';

		setImmediate(function () {
			self._nextLine();
		});
	});

	readStream.on('end', function () {
		self._end = true;

		setImmediate(function () {
			self._nextLine();
		});
	});

	this._readStream = readStream;
};

LineByLineReader.prototype._nextLine = function () {
	var self = this,
		line;

	if (this._paused) {
		return;
	}

	if (this._lines.length === 0) {
		if (this._end) {
			if (this._lineFragment) {
				this.emit('line', this._lineFragment);
				this._lineFragment = '';
			}
			if (!this._paused) {
				this.end();
			}
		} else {
			this._readStream.resume();
		}
		return;
	}

	line = this._lines.shift();

	if (!this._skipEmptyLines || line.length > 0) {
		this.emit('line', line);
	}

	setImmediate(function () {
		if (!this._paused) {
			self._nextLine();
		}
	});
};

LineByLineReader.prototype.pause = function () {
	this._paused = true;
};

LineByLineReader.prototype.resume = function () {
	var self = this;

	this._paused = false;

	setImmediate(function () {
		self._nextLine();
	});
};

LineByLineReader.prototype.end = function () {
	if (!this._ended){
		this._ended = true;
		this.emit('end');
	}
};

LineByLineReader.prototype.close = function () {
	var self = this;

	this._readStream.destroy();
	this._end = true;
	this._lines = [];

	setImmediate(function () {
		self._nextLine();
	});
};

module.exports = LineByLineReader;


/***/ }),

/***/ 614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),

/***/ 304:
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(456);
/******/ })()
;