import model from "../lib/googleAi";
// Add this near the top of your code to debug

const getConversationTitle= async(userPrompt) =>{
    try{
        const result = await model.generateContent(
            `Given a user Prompt, generate a concise and informative title that accurately describes the conversation. Do not generate markdown.
            
            you are multilingual conversational assistant designed to help users understand loan eligibility, guide them through the loan application process, and provide financial literacy tips. 
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


const getAiResponse = async (userPrompt,chats=[]) =>{
 const history = [];
 chats.forEach(({user_prompt, ai_response}) =>{
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
        model.generateCofig = {temperature: 1.0};
        const chat = model.startChat({history });
        const result = await chat.sendMessage(userPrompt);

        return result.response.text();

    }catch(err){
        console.log(`Error generating AI response: ${err.message}`);
    }
};





export {getConversationTitle, getAiResponse}
