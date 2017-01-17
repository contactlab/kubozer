'use strict';

var fs = require('fs');
var path = require('path');
var semver = require('semver');

var configPath = path.resolve('clab-builder.conf');
var config = require(configPath);

function inc(type) {
	config.packageFiles.forEach(function (filePath) {
		var fullFilePath = path.resolve(filePath);
		var data = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
		var oldVersion = data.version;
		data.version = semver.inc(data.version, type);

		var dataString = JSON.stringify(data, null, 2);
		fs.writeFileSync(fullFilePath, dataString);
		console.info('Successfully updated ' + fullFilePath + ' version from ' + oldVersion + ' to ' + data.version);
	});
}

module.exports = {
	inc: inc
};