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
     * Create a generator for SlopWaster.
     * This generator should be configured if necessary.
     * @type {SlopWasterGenerator}
     */
    constructor() {
        /** @type {boolean} Log any actions being done */
        this.verbose = false;
        /** @type {boolean} Warn if anything goes wrong/is odd */
        this.warn = true;
        /** @type {boolean} Throw on non-fatal errors */
        this.error = false;

        /** @type {string?} The output folder to store the playable, and any agent data. Must be an absolute path, and must be set before generation. */
        this.outputFolder = null;

        /** @type {string} The `/api/chat` URL of Ollama. */
        this.ollamaUrl = "http://localhost:11434/api/chat";
        /** @type {AgentPlayableMessage[]} Chat history with a central agent, intended to make the generation process easily interactable. Adjust to use your own system prompt. */
        this.ollamaHistory = [
            {
                role: "system",
                content: "You are the talking agent for a game creation tool."
                    + "\n" + "You are not responsible for generating the game itself. You are the bridge between the user and the internal system tooling."
                    + "\n"
                    + "\n" + "You will be harshly penalized for generating code or discussing programming details about the described game."
                    + "\n" + "If a user asks for specific code or the usage of code, politely decline and mention the underlying aspect introduced by the code instead."
                    + "\n"
                    + "\n" + "You will be rewarded for only describing individual, general details about the game such as:"
                        + " " + "general theme/genre; game mechanics; input mechanisms; visual/audio details; win/loss conditions; and tutorial instructions."
                    + "\n" + "Format all game details in bullet points."
                    + "\n"
                    + "\n" + "All messages will result in a generated game. No matter what you respond with, a game will be generated based on what has been discussed."
                    + "\n" + "You will now chat with the user to create the game. Once your message ends, the game will automatically be attached.",
            },
        ];
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

    /** @private */
    async _makeFolderStructure() {
        if (!this.outputFolder || typeof this.outputFolder !== "string") throw new Error("outputFolder must be an absolute path to a folder");
        if (!path.isAbsolute(this.outputFolder)) throw new Error("outputFolder must be an absolute path to a folder");
        
        try {
            await fs.mkdir(this.outputFolder, { recursive: true });
            await fs.mkdir(this.agentFolder, { recursive: true });
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
        await this._makeFolderStructure();
        
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