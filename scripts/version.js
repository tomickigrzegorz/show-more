const fs = require("node:fs");

const pkg = require("../package.json");

const newVersion = pkg.version;

function updateVersion(file, newVersion) {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      return console.log(err);
    }

    const matches = data.match(/@(.*?)\/dist/i)[1];

    const reg = new RegExp(matches.replace(/\./g, "\\."), "g");

    const result = data.replace(reg, newVersion);

    fs.writeFile(file, result, "utf8", (err) => {
      if (err) return console.log(err);
    });
  });
}

// ------------------------------------------------------------

const someFiles = ["README.md"];

someFiles.forEach((file) => {
  updateVersion(file, newVersion);
});
