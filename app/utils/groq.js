import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


export const getGroqResponse = async (query) => {
    const res = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a friendly chatbot named Tars. Be funny and friendly to the user. Use tools the tool functions available to you when needed.",
            },
            {
                role: "user",
                content: query,
            },
        ],
        model: "llama3-groq-70b-8192-tool-use-preview",
        tool_choice: 'auto',
        tools: [
            {
                type: "function",
                function: {
                    name: "getWeather",
                    description: "Provides the current weather for a given location",
                    parameters: {
                        type: "string",
                        properties: {
                            location: {
                                type: "string",
                                description: "The location to get the weather for",
                            },
                        },
                        required: ["location"],
                    },
                    async handler({ location }) {
                        const weather = await getWeather(location);
                        return weather;
                    }

                },
            },
        ],
    });

    return res;
    
};