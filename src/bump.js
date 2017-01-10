const fs = require('fs');
const path = require('path');
const semver = require('semver');

const configPath = path.resolve('clab-builder.conf');
const config = require(configPath);

function inc(type) {
  config.packageFiles.forEach(filePath => {
    const fullFilePath = path.resolve(filePath);
    const data = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
    const oldVersion = data.version;
    data.version = semver.inc(data.version, type);

    const dataString = JSON.stringify(data, null, 2);
    fs.writeFileSync(fullFilePath, dataString);
    console.info(`Successfully updated ${fullFilePath} version from ${oldVersion} to ${data.version}`);
  });
}

module.exports = {
  inc: inc
};