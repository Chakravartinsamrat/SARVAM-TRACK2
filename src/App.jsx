//anims
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Outlet, useParams, useNavigation, useActionData } from 'react-router-dom';

//components
import PageTitle from './components/PageTitle';
import TopAppBar from './components/TopAppBar';
import SideBar from './components/SideBar';
import PromptField from './components/PromptField';
//custom hooks
import { useToggle } from './hooks/useToggle';
import { useSnackbar } from './hooks/useSnackbar';
import { userPromptPreloader } from './hooks/userPromptPreloader';

//pages
import Greetings from './pages/Greetings';


const App = () => {

  const params = useParams();

  const navigation = useNavigation();

  const actionData = useActionData();

  const chatHistoryRef = useRef();

  const [isSidebarOpen, toggleSidebar] = useToggle();

  const {promptPreloaderValue} = userPromptPreloader();

  const {showSnackBar} = useSnackbar();

  useEffect(()=>{
    const chatHistory = chatHistoryRef.current;
    if (promptPreloaderValue){
      chatHistory.scroll({
        top:chatHistory.scrollHeight - chatHistory.clientHeight,
        behavior:'smooth'
      });
    }
  },[chatHistoryRef, promptPreloaderValue]);

  useEffect(()=>{
    if(actionData?.conversationTitle){
      showSnackBar({
        message:`Deleted '${actionData.conversationTitle}'conversation.`
      });
    }
  },[actionData, showSnackBar]);

  const isNormalLoad = navigation.state === 'loading' && !navigation.formData;
  return (
    <>
      {/*Meta Title*/}
      <PageTitle title='Synchat- Chat with SynChat to supercharge your ideas!' />

      <div className='lg:grid lg:grid-cols-[320px,1fr]'>
        {/*SideBar*/}
        <SideBar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div className='h-dvh grid grid-rows-[max-content,minmax(0,1fr),max-content]'>
          {/*Top App Bar*/}
          <TopAppBar toggleSidebar={toggleSidebar} />

          {/*main Content*/}
          <div ref={chatHistoryRef} className='px-5 pb-5 flex flex-col overflow-y-auto'>
            <div className='max-w-[840px] w-full mx-auto grow '>
              { isNormalLoad? null : params.conversationId ? (
                <Outlet/>
              ):
              (<Greetings />
              )}
              
            </div>
          </div>
          {/*Prompt Field*/}
          <div className='bg-light-background dark:bg-dark-background'>
            <div className='max-w-[870px] px-5 w-full mx-auto'>

              <PromptField/>
              
              <motion.p 
              initial={{opacity: 0, translateY:'-4px'}}
              animate={{opacity: 1, translateY: 0}}
              transition={{duration: 0.2, delay:0.8,
                ease:'easeOut'
              }}
              className='text-bodySmall text-center
              text-light-onSurfaceVariant
              dark:text-dark-onSurfaceVariant p-3'>
                Synchat may display inaccurate info, please verify with the
                official sources.
                <a
                  href='https://support.google.com/gemini?p=privacy_help'
                  target='_blank'
                  className='inline underline ms-1'
                >
                  Your privacy & Gemini Apps
                </a>
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
