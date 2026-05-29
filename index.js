/**
 * @fileoverview this is not the library itself, this will determine whether or not to invoke the "CLI"
 */
const SlopWaster = require("./src/index.js");
module.exports = SlopWaster;

const isModule = require.main !== module;
if (isModule) {
    return SlopWaster;
} else {
    const cli = require("./src/cli.js");
    return (async () => {
        await cli(process.argv);
    })();
}