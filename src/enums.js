/** @typedef {import("./ts/types")} SlopWasterTypes */
const Enums = {};

/**
 * The ollama-chatting chat ID for all interactions.
 * Used if the chat ID literally doesn't matter in the context of the usage.
 * @enum {string}
 */
Enums.OLLAMA_CHAT_ID = "chat";

/**
 * The built-in system prompt for the Agent model.
 * The Agent model is responsible for being the interpreter and communicator between the user and the rest of the AI models.
 * It interprets the prompt and determines what aspects need to be implemented, while also explaining this to the user.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_AGENT = "You are the talking agent for a minigame/application creation tool."
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
    + "\n" + "You will now chat with the user to create the application. Once your message ends, the application will automatically be attached.";
/**
 * The built-in system prompt for the Translator model.
 * The Translator model is responsible for turning the Agent response into technical details for implementation.
 * It should apply universal concepts like logic flow and simplify overscoped ideas.
 * In most cases, it should also describe which libraries will be required for the application.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_TRANSLATOR = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";

/**
 * The built-in system prompt for the Image Outliner model.
 * The Image Outliner model is responsible for determining which image assets will be needed for the described program by the Agent response.
 * It should allow the model to create a structured list of PNG and SVG assets.
 *  
 * The intended structured output is:
 * `{ png:string[], svg:string[] }`
 * with the arrays being arbitrary mini-descriptions of the image asset necessary.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_OUTLINER_IMAGES = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";
/**
 * The built-in system prompt for the Audio Outliner model.
 * The Audio Outliner model is responsible for determining which audio assets will be needed for the described program by the Agent response.
 * It should allow the model to create a structured list of audio assets.
 *  
 * The intended structured output is:
 * `{ audio:string[] }`
 * with the array being arbitrary mini-descriptions of the audio asset necessary.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_OUTLINER_AUDIO = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";
/**
 * The built-in system prompt for the SVG Generator model.
 * The SVG Generator model is responsible for creating the SVG assets outlined by the Image Outliner model.
 * Ideally this prompt should try to enforce strict SVG-only output, with no response padding.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_SVG_GENERATOR = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";

/**
 * The built-in system prompt for the JavaScript Detailer model.
 * The JavaScript Detailer model is responsible for turning the Translator model response into technical JavaScript details for implementation.
 * It should detail what is necessary in the HTML & how to implement things like the keyboard or touch input in JavaScript.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_JAVASCRIPT_DETAILER = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";
// TODO: Do we need a CSS detailer? Might be ideal to make sure that CSS stays consistent on iteration

/**
 * The built-in system prompt for the Coder model.
 * The Coder model is actually responsible for generating all of the code necessary for the playable.
 * 
 * This prompt is intended for the HTML generation step.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_CODER_HTML = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";
/**
 * The built-in system prompt for the Coder model.
 * The Coder model is actually responsible for generating all of the code necessary for the playable.
 * 
 * This prompt is intended for the CSS generation step. The generated HTML is also included in the chat for context.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_CODER_CSS = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";
/**
 * The built-in system prompt for the Coder model.
 * The Coder model is actually responsible for generating all of the code necessary for the playable.
 * 
 * This prompt is intended for the JavaScript generation step. The generated HTML is also included in the chat for context.
 * @enum {string}
 */
Enums.OLLAMA_PROMPT_CODER_JAVASCRIPT = "You are the talking agent for a minigame/application creation tool."
    + "\n" + "text.";

module.exports = Enums;