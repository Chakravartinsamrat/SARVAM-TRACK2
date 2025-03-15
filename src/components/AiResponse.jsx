import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";

import { iconlogo } from "../assets/assets";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHiglighter} from 'react-syntax-highlighter';
import { hopscotch, coy } from "react-syntax-highlighter/dist/esm/styles/prism";



//components
import {IconBtn} from './Button';
import toTitleCase from "../utils/toTitleCase";
import {useSnackbar} from '../hooks/useSnackbar';

const AiResponse = ({aiResponse, children}) => {
  const [codeTheme, setCodeTheme] = useState("");

  const {showSnackBar, hideSnackBar} = useSnackbar();

  useEffect(()=>{
  const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');

    setCodeTheme(mediaQuery.matches ? hopscotch: coy);

  const themeListener = mediaQuery.addEventListener ('change', (event) =>{
    setCodeTheme(event.matches ? hopscotch : coy);
  });

  return () => mediaQuery.removeEventListener('change',themeListener );
  },[]);

  // <----------checkpoint-------->
  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackBar({  
        message: 'Copied to Clipboard',
        timeOut: '2500'
      });
    } catch (err) {
      showSnackBar({ 
        message: err.message,
      });
      console.log(`Error Copying the text to clipboard: ${err.message}`);
    }
  }, [showSnackBar, hideSnackBar]);

  const code = ({children, className, ...rest}) =>{
    const match = className?.match(/language-(\w+)/);

    return match ? (
      <>
      <div className="code-block">
        <div className="p-4 pb-0 font-sans">{match[0]}
          <SyntaxHiglighter
            {...rest}
            PreTag='div'
            language={toTitleCase(match[1])}
            style={codeTheme}
            customStyle={{
              marginBlock:'0',
              padding: '2px',
            }}
            codeTagProps={{
              style:{
                padding:'14px',
                fontWeight:'600',
              },
            }}
          >
            {children}
          </SyntaxHiglighter>
        </div>
      </div>
      <div className="bg-light-surfaceContainer dark:bg-dark-surfaceContainer rounded-t-extraSmall rounded-b-medium flex justify-between items-center h-11 font-sans text-bodyMedium ps-4 pe-2">
            <p>
              Use code
              <a href="https://gemini.google.com/faq#coding" className="link ms-2" target="_blank">
              with caution</a>
            </p>

            <IconBtn 
            icon='content_copy'
            size='small'
            title='Copy code'
            onClick={handleCopy.bind(null,children )}
            />
      </div>
      </>
    ):(
      <code className={className}> {children} </code>

    )
  };
  return(
    <div className="">
        <figure className="">
            <img src={iconlogo} width={32} height={32} alt=""  />
        </figure>
        {children}

        {aiResponse &&(
          <div className="markdown-content">
        <Markdown remarkPlugins={[remarkGfm]} components={{
          code
        }}>
                {typeof aiResponse === 'string' ? aiResponse : ''}
        </Markdown>
        </div>
        )}
        
    </div>
  );
}

AiResponse.propTypes ={
    aiResponse: PropTypes.string,
    children:PropTypes.any,
};

export default AiResponse;