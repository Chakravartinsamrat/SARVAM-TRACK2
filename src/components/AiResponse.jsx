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
import TextToSpeech from './TextToSpeech'; // Import the new component

const AiResponse = ({aiResponse, children}) => {
  const [codeTheme, setCodeTheme] = useState("");
  const [textContent, setTextContent] = useState(""); // To store plain text for TTS

  const {showSnackBar, hideSnackBar} = useSnackbar();

  useEffect(() => {
    // Extract plain text from Markdown for TTS
    if (aiResponse) {
      // Simple markdown to text conversion (basic version)
      // For a more robust solution, consider using a markdown-to-text library
      const plainText = aiResponse
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`.*?`/g, '') // Remove inline code
        .replace(/#+\s(.*)/g, '$1') // Convert headers to plain text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just their text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\n\s*\n/g, '\n\n'); // Normalize line breaks
      
      setTextContent(plainText);
    }
  }, [aiResponse]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');

    setCodeTheme(mediaQuery.matches ? hopscotch : coy);

    const themeListener = (event) => {
      setCodeTheme(event.matches ? hopscotch : coy);
    };

    mediaQuery.addEventListener('change', themeListener);

    return () => mediaQuery.removeEventListener('change', themeListener);
  }, []);

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
  }, [showSnackBar]);

  const code = ({children, className, ...rest}) => {
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
            <a href="https://gemini.google.com/faq#coding" className="link ms-2" target="_blank" rel="noreferrer">
              with caution
            </a>
          </p>

          <IconBtn 
            icon='content_copy'
            size='small'
            title='Copy code'
            onClick={() => handleCopy(children)}
          />
        </div>
      </>
    ) : (
      <code className={className}> {children} </code>
    );
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <figure className="">
          <img src={iconlogo} width={32} height={32} alt="AI Assistant" />
        </figure>
        {aiResponse && <TextToSpeech text={textContent} language="en-IN" />}
      </div>
      
      {children}

      {aiResponse && (
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
};

AiResponse.propTypes = {
  aiResponse: PropTypes.string,
  children: PropTypes.any,
};

export default AiResponse;