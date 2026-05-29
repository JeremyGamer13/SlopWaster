declare namespace SlopWasterTypes {
    /** A chat message with a central agent, intended to make the generation process easily interactable. */
    interface AgentPlayableMessage {
        /** The role of this message. */
        role: "user" | "assistant" | "system";
        /** The content of the message. */
        content: string;
        /** The thinking part of the message. */
        thinking: string | null;
    }
    /** The structure of an object that is the result of generating or iterating on a playable. */
    interface AgentPlayableResponse extends AgentPlayableMessage {
        /** The role of this message. Will always be `"assistant"` */
        role: "assistant";
        /** A user-friendly response outlining the result of creating the playable. */
        content: string;
        /** The path to the `/playable/index.html` file. Will always be `Generator.outputPlayable` */
        playable: string | null;
    }
}
