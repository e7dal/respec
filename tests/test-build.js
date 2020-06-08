/* eslint-env node */
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);
const path = require("path");
const expect = require("chai").expect;
const { Builder } = require("../tools/builder");

async function checkIfFileExists(filePath) {
  const stats = await lstat(filePath);
  return stats.isFile();
}

describe("builder (tool)", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  const profiles = ["w3c", "geonovum"];

  beforeAll(async () => {
    await Promise.all(
      profiles.map(profile => Builder.build({ name: profile }))
    );
  });

  for (const profile of profiles) {
    const profileFile = path.join(__dirname, `../builds/respec-${profile}.js`);
    const mapFile = path.join(__dirname, `../builds/respec-${profile}.js.map`);
    it(`builds the "${profile}" profile and sourcemap`, async () => {
      expect(await checkIfFileExists(profileFile)).to.equal(true);
      expect(await checkIfFileExists(mapFile)).to.equal(true);
    });
    it(`includes sourcemap link for "${profile}"`, async () => {
      const source = await readFile(profileFile, "utf-8");
      expect(source.includes(`${profile}.js.map`)).to.equal(true);
    });
  }
});
