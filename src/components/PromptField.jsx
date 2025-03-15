
import { motion } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import { useNavigation, useSubmit, useParams } from 'react-router-dom';


//components
import { IconBtn } from './Button';

const PromptField = () => {
  //holds references in thier DOM Container
  const inputField = useRef();
  const inputFieldContainer = useRef();

  //manual form submission
  const submit = useSubmit();
  //INITIAL navigation fro checking state

  const navigation = useNavigation();

  const {conversationId } = useParams();


  //state for input field
  const [placeholderShown, setPlaceholderShown] = useState(true);
  const [isMultiline, setMultiline] = useState(false);
  const [inputValue, setInputValue] = useState('');

  //handle input field input change
  const handleInputChange = useCallback(() => {
    if (inputField.current.innerText === '\n')
      inputField.current.innerHTML = '';

    setPlaceholderShown(!inputField.current.innerText);
    setMultiline(inputFieldContainer.current.clientHeight > 64);
    setInputValue(inputField.current.innerText.trim());
  }, []);

  //move the cursor to the end after paste
  const moveCursorToEnd = useCallback(() => {
    const editableElem = inputField.current;
    const range = document.createRange();
    const selection = window.getSelection();

    //set the range to the last child of the editable element
    range.selectNodeContents(editableElem);
    range.collapse(false);

    //clear existing selections and add new range
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  //handling paste
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      inputField.current.innerText += e.clipboardData.getData('text');
      handleInputChange();
      moveCursorToEnd();
    },
    [handleInputChange, moveCursorToEnd],
  );

  //handling submit gemini integration from here on
  const handleSubmit = useCallback(() => {
    if(!inputValue || navigation.state ==='submitting')
      return;
    submit(
      {
        user_prompt:inputValue,
        request_type:'user_prompt',

      },
      {
        method:'POST',
        encType:'application/x-www-form-urlencoded',
        action: `/${conversationId || ''}`,
      }
    );


    inputField.current.innerHTML = '';
    handleInputChange();
  }, [handleInputChange, inputValue, navigation.state, submit, conversationId]);


  
    // MAIN PART STARTS
  //motion on prompt box and it's child
  const promptFieldVariant = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        duratioon: 0.4,
        delay: 0.4,
        ease: [0.05, 0.7, 0.1, 1],
      },
    },
  };
  const promptFieldChildrenVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      className={`prompt-field-container ${isMultiline ? 'rounded-large' : ''}`}
      variants={promptFieldVariant}
      initial='hidden'
      animate='visible'
      ref={inputFieldContainer}
    >
      <motion.div
        className={`prompt-field ${placeholderShown ? '' : 'after:hidden'} `}
        contentEditable={true}
        role='textbox'
        aria-multiline={true}
        aria-label='Enter a prompt here'
        data-placeholder='Enter a prompt here'
        variants={promptFieldChildrenVariant}
        ref={inputField}
        onInput={handleInputChange}
        onPaste={handlePaste}
        onKeyDown={(e)=>{
          if(e.key ==='Enter' && !e.shiftKey){
            //submit input'
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <IconBtn
        icon='send'
        title='Submit'
        size='large'
        classes='ms-auto'
        variants={promptFieldChildrenVariant}
        onClick={handleSubmit}
      />

      <div className='state-layer'></div>
    </motion.div>
  );
};

export default PromptField;
