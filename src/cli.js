/**
 * @fileoverview the `slopwaster` cli
 */
const fs = require("fs/promises");
const path = require("path");

const yargs = require("yargs");
const { hideBin } = require('yargs/helpers');

const SlopWaster = require("./index.js");
const invoke = async (processArgv) => {
    const argv = await yargs(hideBin(processArgv))
        // general
        .option("verbose", { alias: "v", type: "boolean", default: true, description: "Log any actions being done" })
        .option("warn", { alias: "w", type: "boolean", default: true, description: "Warn if anything goes wrong/is odd" })
        .option("error", { alias: "e", type: "boolean", default: false, description: "Exit on non-fatal errors" })
        // input/output
        .option("prompt", { alias: "p", type: "string", description: "The prompt to generate the game off of. Adjust `ollama_history` to use your own system prompt." })
        .option("prompt_file", { type: "string", description: "The prompt to generate the game off of, contained within a text file." })
        .option("output", { alias: "o", type: "string", description: "The output folder to store the playable, and any agent data. Must be an absolute path.", demandOption: true })
        // iteration
        .option("iterate", { alias: "iter", type: "boolean", description: "Iterate on the playable based on the prompt. Previous agent messages can be provided in `ollama_history`."
            + "\n" + "The underlying internal ML model interactions are stored within the `/agent` folder." })
        // ollama
        .option("ollama_url", { type: "string", default: "http://localhost:11434/api/chat", description: "The `/api/chat` URL of Ollama." })
        .option("ollama_history", { type: "string", description: "Chat history with a central agent, intended to make the generation process easily interactable. This information should be contained within a JSON file." })
        .parseAsync();
    if (argv.help) return;

    // make the generator
    const swGenerator = new SlopWaster(argv.output);
    swGenerator.verbose = argv.verbose;
    swGenerator.warn = argv.warn;
    swGenerator.error = argv.error;

    swGenerator.ollamaUrl = argv.ollama_url;
    // these inputs have to be taken differently
    // prompt
    let inputPrompt = argv.prompt;
    if (argv.prompt && argv.prompt_file && argv.warn) console.warn("prompt will be ignored over prompt_file");
    if (argv.prompt_file) {
        const encoding = "utf8";
        if (argv.verbose) console.log(`Reading prompt_file`, argv.prompt_file, encoding);
        const promptText = await fs.readFile(argv.prompt_file, encoding);
        inputPrompt = promptText;
    }
    if (!inputPrompt) throw new Error("Either `prompt` or `prompt_file` is required, and cannot be empty. Use a functionally empty prompt like \".\" if you need no input.");
    // ollama_history
    if (argv.ollama_history) {
        const encoding = "utf8";
        if (argv.verbose) console.log(`Reading ollama_history file`, argv.ollama_history, encoding);
        const chatHistoryText = await fs.readFile(argv.ollama_history, encoding);
        if (argv.verbose) console.log(`Parsing ollama_history as JSON`);
        swGenerator.ollamaHistory = JSON.parse(chatHistoryText);
    }

    // actually gneerate now
    if (argv.verbose) console.log("Starting generation, Iterate:", argv.iterate);
    const agentResponse = await (!argv.iterate ? swGenerator.generate(inputPrompt) : swGenerator.iterate(inputPrompt));
    // TODO: This should probably be stringified to remove fancy console formatting
    console.log(agentResponse);
};

module.exports = invoke;