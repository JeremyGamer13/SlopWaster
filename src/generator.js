/** @typedef {import("./ts/types")} SlopWasterTypes */
const fs = require("fs/promises");
const path = require("path");

const Ollama = require("ollama-chatting");

const Enums = require("./enums");

/**
 * Create instances of this class to generate games.
 * @type {Generator}
 */
class Generator {
    // TODO: Make a type for the input to the constructor, and make it an object. This is so Ollama stuff can be created at the start.
    /**
     * Create a generator for SlopWaster.
     * This generator should be configured if necessary.
     * @type {Generator}
     * @param {string} outputFolder The output folder to store the playable, and any agent data. Must be an absolute path, and must be set before generation.
     */
    constructor(outputFolder) {
        /** @type {boolean} Log any actions being done */
        this.verbose = false;
        /** @type {boolean} Warn if anything goes wrong/is odd */
        this.warn = true;
        /** @type {boolean} Throw on non-fatal errors */
        this.error = false;

        /** @type {string?} The output folder to store the playable, and any agent data. Must be an absolute path, and must be set before generation. */
        this.outputFolder = outputFolder;

        // TODO: Move this around so Ollama stuff is easier to config and isn't handled all messy (_ollamaClientInstance is really ugly). Likely just make the constructor use an object for initialization and create the ollama clients in the constructor
        /** @type {SlopWasterTypes.AgentPlayableMessage[]} Chat history with a central agent, intended to make the generation process easily interactable. Adjust to use your own system prompt. */
        this.ollamaHistory = [
            {
                role: "system",
                content: Enums.OLLAMA_PROMPT_AGENT,
            },
        ];

        // internal stuff
        this._ollamaUrl = "http://localhost:11434/api/chat";
        /** @type {import("ollama-chatting")} */
        this._ollamaClientInstance = null;
    }
    /**
     * The path of the `agent` folder. This folder should not be deleted entirely if you want to use `iterate`.
     * @returns {string?}
     */
    get agentFolder() {
        if (!this.outputFolder || typeof this.outputFolder !== "string") return null;
        if (!path.isAbsolute(this.outputFolder)) return null;
        return path.join(this.outputFolder, "/agent");
    }
    /**
     * The path of the `agent/userspace` folder. This is a safe folder inside of `agentFolder` for external programs/libraries
     * to store things (ie, chat history) but keep them organized with the rest of the generation process.
     * @returns {string?}
     */
    get agentUserspaceFolder() {
        if (!this.outputFolder || typeof this.outputFolder !== "string") return null;
        if (!path.isAbsolute(this.outputFolder)) return null;
        return path.join(this.outputFolder, "/agent/userspace");
    }
    /**
     * The path of the `playable` folder. Will be filled upon a successful generation.
     * @returns {string?}
     */
    get playableFolder() {
        if (!this.outputFolder || typeof this.outputFolder !== "string") return null;
        if (!path.isAbsolute(this.outputFolder)) return null;
        return path.join(this.outputFolder, "/playable");
    }
    /**
     * The path of the `playable/index.html`. Will be created upon a successful generation.
     * @returns {string?}
     */
    get outputPlayable() {
        const playableFolder = this.playableFolder;
        if (!playableFolder) return null;
        return path.join(playableFolder, "index.html");
    }

    /**
     * The `/api/chat` URL of Ollama.
     * @type {string}
     */
    get ollamaUrl() {
        return this._ollamaUrl;
    }
    set ollamaUrl(newUrl) {
        this._ollamaUrl = newUrl;
        if (this._ollamaClientInstance) {
            this._ollamaClientInstance.apiUrl = this._ollamaUrl;
        }
    }

    /**
     * Generate a playable based on a prompt. Adjust `ollamaHistory` to use your own system prompt.
     * 
     * Should only be used if the `outputFolder` is empty or contains no agent data.
     * If the `outputFolder` already contains data, the `iterate` method should be used instead.
     * 
     * If this method fails, empty out the `outputFolder` before re-running.
     * @param {string} prompt The prompt to generate the game off of.
     * @returns {SlopWasterTypes.AgentPlayableResponse}
     */
    async generate(prompt) {
        // initiate the process
        await this._makeFolderStructure();
        this._ollamaClient.overwriteChat(Enums.OLLAMA_CHAT_ID, this.ollamaHistory);

        const response = await this._ollamaClient.chatPrompt(Enums.OLLAMA_CHAT_ID, prompt);
        return {
            role: "assistant",
            content: response.content,
            thinking: response.thinking,
            playable: this.outputPlayable,
        }
    }
    // TODO: add iteration, likely add the technical & "javascript detail" generations to a chat and, in a new message, tell it to redo them based on the reiterated Agent message + technical detail message
    /**
     * Iterate on the playable based on a prompt. Previous agent messages are stored in `ollamaHistory`.
     * The underlying internal ML model interactions are stored within the `agentFolder`.
     * 
     * Should only be used if the `outputFolder` already contains agent data.
     * @param {string} prompt The prompt to generate the game off of.
     * @returns {SlopWasterTypes.AgentPlayableResponse}
     */
    async iterate(prompt) {
        await this._makeFolderStructure();
        throw new Error("Not implemented");
    }

    // internal stuff
    /** @private @type {import("ollama-chatting")} */
    get _ollamaClient() {
        if (!this._ollamaClientInstance) {
            // TODO: Make this configurable (model, thinking, timeout)
            this._ollamaClientInstance = new Ollama({
                model: "qwen3-vl:8b",
                thinking: false,
                timeout: 10 * 60 * 1000,
                url: this._ollamaUrl,
            });
        }
        return this._ollamaClientInstance;
    }
    /** @private */
    async _makeFolderStructure() {
        if (!this.outputFolder || typeof this.outputFolder !== "string") throw new Error("outputFolder must be an absolute path to a folder");
        if (!path.isAbsolute(this.outputFolder)) throw new Error("outputFolder must be an absolute path to a folder");

        try {
            await fs.mkdir(this.outputFolder, { recursive: true });
            await fs.mkdir(this.agentFolder, { recursive: true });
            await fs.mkdir(this.agentUserspaceFolder, { recursive: true });
            await fs.mkdir(this.playableFolder, { recursive: true });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Generator;