const core = require('@actions/core');
const lineReader = require('line-by-line');
const fs = require('fs');

try {
	const regex = /(\s*[\w\d]+_test.go:\d+:)(.*?)(Test:\s+Test[\w\d]*?%0A)/gu; // Extracts only the failure from the logs (including whitespace)

	const testResultsPath = core.getInput('test-results');
	const customPackageName = core.getInput('package-name');

	if (!fs.existsSync(testResultsPath)) {
		core.warning(
			`No file was found with the provided path: ${testResultsPath}.`
		)
		return
	}

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
		// Strip github.com/owner/repo package from the path by default
		var packageName = currentLine.Package.split("/").slice(3).join("/");
		// If custom package is provided, strip custom package name from the path
		if (customPackageName !== "") {
			if (!currentLine.Package.startsWith(customPackageName)) {
				core.warning(
					`Expected ${currentLine.Package} to start with ${customPackageName} since "package-name" was provided.`
				)
			} else {
				packageName = currentLine.Package.replace(customPackageName + "/", "")
			}
		}
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
				var result;
				while ((result = regex.exec(value)) !== null) {
					const parts = result[0].split(":");
					const file = key.split("/").slice(0, -1).join("/") + "/" + parts[0].trimStart();
					const lineNumber = parts[1];
					core.info(`::error file=${file},line=${lineNumber}::${result[0]}`);
				}
			}
		}
	});
} catch (error) {
	core.setFailed(error.message);
}
