//modules
import { redirect } from 'react-router-dom';

//custom
import { account, databases } from '../../lib/appwrite';
import { getConversationTitle, getAiResponse ,getPdfAnalysis} from '../../api/googleAi';
import generateID from '../../utils/generateID';



const conversationAction = async (formData) => {
  const conversationId = formData.get('conversation_id');
  const conversationTitle = formData.get('conversation_title');

  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'conversations',
      conversationId
    );
    return { conversationTitle };
  } catch (err) {
    console.log(`Error in deleting Conversation: ${err.message}`);
  }
};



const userPromptAction = async (formData) => {
  const userPrompt = formData.get('user_prompt');

  //user info
  const user = await account.get();

  //gget convotitle based on user Prompt
  const conversationTitle = await getConversationTitle(userPrompt);
  let conversation = null;
  try {
    conversation = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'conversations',
      generateID(),{
        title:conversationTitle,
        user_id: user.$id,
      },
    );
  } catch (err) {
    console.log(`Error Creating Conversation: ${err.message}`);
    

  }
  //generate Response
  const aiResponse = await getAiResponse(userPrompt);
  try{
    await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'chats',
      generateID(),
      {
        user_prompt: userPrompt,
        ai_response: aiResponse,
        conversation: conversation.$id,
      },
    );
  }catch(err){
     console.log(`Error in getting a response: ${err.message}`);
  }


  return redirect(`/${conversation.$id}`);
};

// Add this new function to handle PDF analysis requests
const pdfAnalysisAction = async (formData) => {
  const userPrompt = formData.get('user_prompt');
  const pdfData = formData.get('pdf_data');
  
  // User info
  const user = await account.get();
  
  // Get conversation title based on user prompt or use default
  const conversationTitle = await getConversationTitle(userPrompt) || "PDF Document Analysis";
  
  // Create conversation document
  let conversation = null;
  try {
    conversation = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'conversations',
      generateID(),
      {
        title: conversationTitle,
        user_id: user.$id,
      },
    );
  } catch (err) {
    console.log(`Error Creating Conversation: ${err.message}`);
  }
  
  // Generate response using the PDF analysis function
  const aiResponse = await getPdfAnalysis(pdfData, userPrompt);
  
  try {
    await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'chats',
      generateID(),
      {
        user_prompt: userPrompt,
        ai_response: aiResponse,
        conversation: conversation.$id,
      },
    );
  } catch (err) {
    console.log(`Error in getting a response: ${err.message}`);
  }
  
  return redirect(`/${conversation.$id}`);
};


const appAction = async ({ request }) => {
  const formData = await request.formData();
  const requestType = formData.get('request_type');

  if (requestType === 'user_prompt') {
    return await userPromptAction(formData);
  }

  if(requestType === 'delete_conversation'){
    return await conversationAction(formData);
  }
  if (requestType === 'pdf_analysis') {
    return await pdfAnalysisAction(formData);
  }
};

export default appAction;
