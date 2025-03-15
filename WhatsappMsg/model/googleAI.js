import model from "../lib/googleAI.js";

const getAiResponse = async (userPrompt, chats = []) => {
    const history = [];
    chats.forEach(({user_prompt, ai_response}) => {
        history.push(
            {
                role: 'user',
                parts: [{text: user_prompt}]
            },
            {
                role: 'model',
                parts: [{text: ai_response}]
            }
        );
    });

    try {
        // Fixed typo in config setting
        model.generateConfig = { temperature: 1.0 }; // Reduced temperature for more consistent responses
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userPrompt);

        return result.response.text();
    } catch (err) {
        console.log(`Error generating AI response: ${err.message}`);
        return "I'm having trouble generating a response right now. Please try again later.";
    }
};

export { getAiResponse };