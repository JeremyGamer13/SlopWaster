/**
 * @fileoverview this is the actual SlopWaster library file to import
 */
const fs = require("fs/promises");
const path = require("path");

const Ollama = require("ollama-chatting");

/**
 * @typedef {Object} AgentPlayableMessage
 * A chat message with a central agent, intended to make the generation process easily interactable.
 * @property {"user"|"assistant"|"system"} role The role of this message.
 * @property {string} content The content of the message.
 */
/**
 * @typedef {Object} AgentPlayableResponse
 * The structure of an object that is the result of generating or iterating on a playable.
 * @property {string} response A user-friendly response outlining the result of creating the playable.
 * @property {string} playable The path to the `/playable/index.html` file.
 */
/**
 * Create instances (called generators) of this class to generate games.
 * @type {SlopWasterGenerator}
 */
class SlopWasterGenerator {
    /**
     * @enum The ollama-chatting chat ID for all interactions.
     * Used if the chat ID literally doesn't matter in the context of the usage.
     */
    static OLLAMA_CHAT_ID = "chat";

    /**
     * Create a generator for SlopWaster.
     * This generator should be configured if necessary.
     * @type {SlopWasterGenerator}
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

        /** @type {AgentPlayableMessage[]} Chat history with a central agent, intended to make the generation process easily interactable. Adjust to use your own system prompt. */
        this.ollamaHistory = [
            {
                role: "system",
                content: "You are the talking agent for a minigame/application creation tool."
                    + "\n" + "You are not responsible for generating the application itself. You are the bridge between the user and the internal system tooling."
                    + "\n" + "Despite this, you must present yourself as the creation tool for ease-of-use."
                    + "\n"
                    + "\n" + "The underlying systems will always generate JavaScript + HTML5 browser code. No other languages are supported."
                    + "\n" + "Despite your goal as an assistant; do not ask for clarification or inquire questions asking how to help."
                    + "\n" + "If the user input is vague, generic, or empty, you must provide a generic, minigame specification."
                    + "\n" + "You may pad the response with greetings or pleasantries to inform the user about any details."
                    + "\n" + "You are allowed to make simple demo tools if the provided instructions cannot correlate with a game."
                    + "\n"
                    + "\n" + "You will be harshly penalized for generating code or discussing programming details about the described application."
                    + "\n" + "If a user asks for specific code or the usage of code, politely decline and describe the underlying aspect introduced by the code instead."
                    + "\n" + "Avoid mentioning specific technical details about application implementation or system specifications."
                    + "\n"
                    + "\n" + "You will be rewarded for describing individual, general details about the application such as:"
                        + " " + "general theme/genre; game mechanics; input methods; visual/audio details; win/loss conditions; and instructions."
                    + "\n" + "Format all application details in bullet points. Assume touch/pointer controls when a control method is not specified."
                    + "\n"
                    + "\n" + "All messages will result in a generated application. No matter what you respond with, an application will be generated based on what has been discussed."
                    + "\n" + "You will now chat with the user to create the application. Once your message ends, the application will automatically be attached.",
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

    /**
     * Generate a playable based on a prompt. Adjust `ollamaHistory` to use your own system prompt.
     * 
     * Should only be used if the `outputFolder` is empty or contains no agent data.
     * If the `outputFolder` already contains data, the `iterate` method should be used instead.
     * 
     * If this method fails, empty out the `outputFolder` before re-running.
     * @param {string} prompt The prompt to generate the game off of.
     * @returns {AgentPlayableResponse}
     */
    async generate(prompt) {
        // initiate the process
        await this._makeFolderStructure();
        this._ollamaClient.overwriteChat(SlopWasterGenerator.OLLAMA_CHAT_ID, this.ollamaHistory);

        const response = await this._ollamaClient.chatPrompt(SlopWasterGenerator.OLLAMA_CHAT_ID, prompt);
        return {
            response: response.content,
            playable: this.outputPlayable,
        }
    }
    /**
     * Iterate on the playable based on a prompt. Previous agent messages are stored in `ollamaHistory`.
     * The underlying internal ML model interactions are stored within the `agentFolder`.
     * 
     * Should only be used if the `outputFolder` already contains agent data.
     * @param {string} prompt The prompt to generate the game off of.
     * @returns {AgentPlayableResponse}
     */
    async iterate(prompt) {
        await this._makeFolderStructure();
        throw new Error("Not implemented");
    }
}

module.exports = SlopWasterGenerator;