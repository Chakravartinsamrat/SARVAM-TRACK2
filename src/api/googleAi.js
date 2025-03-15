import model from "../lib/googleAi";
// Add this near the top of your code to debug

const getConversationTitle = async(userPrompt) => {
    try{
        const result = await model.generateContent(
            `Given a user Prompt, generate a concise and informative title that accurately describes the conversation. Do not generate markdown.
            
            you are multilingual conversational assistant designed to help users understand loan eligibility, guide them through the loan application process, and provide financial literacy tips. Your goal is to assist users efficiently, ensuring they receive clear, accurate, and helpful financial guidance through voice or text interactions.
            Give Responses in input Languages

            Anything other than Loan and Finances, Respond with "I cannot help you with that".
            Prompt:${userPrompt}`,
        );
        return result.response.text();
    }
    catch(err){
        console.log(`Error generating conversation title:${err.message}`);
        console.log("All env vars:", import.meta.env);
    }
};


const getAiResponse = async (userPrompt, chats=[]) => {
 const history = [];
 chats.forEach(({user_prompt, ai_response}) => {
    history.push(
        {
            role:'user',
            parts:[{text:user_prompt}]
        },
        {
            role:'model',
            parts: [{text: ai_response}]
        }
    )
 });

    try{
        model.generateConfig = {temperature: 1.0}; // Fixed typo: generateCofig -> generateConfig
        const chat = model.startChat({history});
        const result = await chat.sendMessage(userPrompt);

        return result.response.text();

    }catch(err){
        console.log(`Error generating AI response: ${err.message}`);
    }
};

// New function to handle PDF analysis
const getPdfAnalysis = async (pdfData, userPrompt, chats=[]) => {
    try {
        // For PDFs being processed as base64 data
        if (typeof pdfData === 'string') {
            const result = await model.generateContent([
                {
                    inlineData: {
                        data: pdfData,
                        mimeType: "application/pdf",
                    }
                },
                userPrompt || 'Summarize this document'
            ]);
            
            return result.response.text();
        } 
        // For PDFs being processed through fileUri (for large files via File API)
        else if (pdfData.fileUri) {
            const result = await model.generateContent([
                {
                    fileData: {
                        fileUri: pdfData.fileUri,
                        mimeType: "application/pdf",
                    }
                },
                userPrompt || 'Summarize this document'
            ]);
            
            return result.response.text();
        }
        else {
            throw new Error("Invalid PDF data format");
        }
    } catch (err) {
        console.log(`Error analyzing PDF: ${err.message}`);
        return `Error analyzing PDF: ${err.message}`;
    }
};

export {getConversationTitle, getAiResponse, getPdfAnalysis}