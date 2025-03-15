//modules
import { motion } from 'framer-motion';

//routers and loaders
import { useLoaderData , useLocation} from 'react-router-dom';

//components
import PageTitle from '../components/PageTitle';
import UserPrompt from '../components/UserPrompt';
import AiResponse from '../components/AiResponse';
import PromptPreloader from '../components/PromptPreloader';

//hooks
import { userPromptPreloader } from '../hooks/userPromptPreloader';

const Conversation = () => {
  const {
    conversation: { title, chats },
  } = useLoaderData() || {};

//promptloader ka value obtain karo
  const { promptPreloaderValue} = userPromptPreloader();
//url location information obtain through this fucntion
  const location = useLocation();
  return (
    <>
      {/* Meta title */}

      <PageTitle title={`${title} | Synchat`} />

      <motion.div className='max-w-[700px] mx-auto !will-change-auto' 
      initial={location.state?._isRedirect &&{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:0., delay:0.05, ease: 'easeOut'}}
      >
        {chats.map((chat) => (
          <>
            <div key={chat.$id}>
                {/* user prompt */}
                <UserPrompt text={chat.user_prompt}/>

            
                {/* ai response */}

                <AiResponse aiResponse={chat.ai_response}/>
            </div>
          </>
        ))}
      </motion.div>
        {promptPreloaderValue && (
          <PromptPreloader promptValue={promptPreloaderValue}/>
        )}
      
    </>
  );
};

export default Conversation;
