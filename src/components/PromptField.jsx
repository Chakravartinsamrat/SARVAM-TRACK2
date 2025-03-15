import { motion } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import { useNavigation, useSubmit, useParams } from 'react-router-dom';
import PdfTranslator from './pdfTranslator';

//components
import { IconBtn } from './Button';

const PromptField = () => {
  //holds references in thier DOM Container
  const inputField = useRef();
  const inputFieldContainer = useRef();

  //manual form submission
  const submit = useSubmit();
  //INITIAL navigation fro checking state

  //NOW I WILL HANDLE THE VOICE TRANSLATION REQUEST
  const [isRecording, setIsRecording] = useState(false);

  const navigation = useNavigation();

  const { conversationId } = useParams();

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
    if (!inputValue || navigation.state === 'submitting') return;
    submit(
      {
        user_prompt: inputValue,
        request_type: 'user_prompt',
      },
      {
        method: 'POST',
        encType: 'application/x-www-form-urlencoded',
        action: `/${conversationId || ''}`,
      },
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

  //FUCNTION TO hanfle microphone click
  const handleMicrophoneClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording]);

  //anna start recording na?
  const startRecording = useCallback(() => {
    setIsRecording(true);

    // Create a MediaRecorder instance
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          sendAudioToSarvam(audioBlob);
        });

        // Start recording for 5 seconds (can be adjusted)
        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 5000);

        // Store mediaRecorder reference to stop it manually
        window.mediaRecorder = mediaRecorder;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
      });
  }, []);
  // Function to stop recording manually
  const stopRecording = useCallback(() => {
    if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
      window.mediaRecorder.stop();
    }
    setIsRecording(false);
  }, []);

  const sendAudioToSarvam = useCallback(
    async (audioBlob) => {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('model', 'saarika:v2');
        formData.append('language_code', 'unknown'); // Use "unknown" for auto-detection

        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: {
            'api-subscription-key': import.meta.env.VITE_SARVAM_API_KEY,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.transcript) {
          // Set the transcript to the input field
          inputField.current.innerText = data.transcript;
          handleInputChange();
        }
      } catch (error) {
        console.error('Error with speech-to-text:', error);
      }
    },
    [handleInputChange],
  );

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
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            //submit input'
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <PdfTranslator/>
      <IconBtn
        icon='send'
        title='Submit'
        size='large'
        classes='ms-auto'
        variants={promptFieldChildrenVariant}
        onClick={handleSubmit}
      />
      <IconBtn
        icon={isRecording ? 'stop' : 'microphone'}
        title={isRecording ? 'Stop' : 'Voice Input'}
        size='large'
        classes={`ms-auto ${isRecording ? 'recording-active' : ''}`}
        variants={promptFieldChildrenVariant}
        onClick={handleMicrophoneClick}
      />
      {/* <IconBtn
        icon={Translate}
        title={}
        size='large'
        classes='ms-auto'
        variants={promptFieldChildrenVariant}
        onClick={handleTranslate}
       
      /> */}
    </motion.div>
  );
};

export default PromptField;
