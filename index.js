const core = require('@actions/core');
const lineReader = require('line-by-line');

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
