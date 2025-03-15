import { motion } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import { useNavigation, useSubmit, useParams } from 'react-router-dom';
import PdfTranslator from '../components/PdfTranslator';

//components
import { IconBtn } from '../components/Button';
import { FileText } from 'lucide-react';

const PromptField = () => {
  //holds references in their DOM Container
  const inputField = useRef();
  const inputFieldContainer = useRef();

  //manual form submission
  const submit = useSubmit();

  //NOW I WILL HANDLE THE VOICE TRANSLATION REQUEST
  const [isRecording, setIsRecording] = useState(false);

  // State for PDF translator popup
  const [showPdfTranslator, setShowPdfTranslator] = useState(false);
  
  // New state to track if we're handling a PDF
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

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
    if ((!inputValue && !isPdfMode) || navigation.state === 'submitting') return;
    
    // Create FormData for the request
    const formData = new FormData();
    
    if (isPdfMode && pdfFile) {
      // For PDF mode, send the PDF file to Gemini
      formData.append('pdf_file', pdfFile);
      formData.append('request_type', 'pdf_analysis');
      formData.append('user_prompt', inputValue || 'Please describe the content of this PDF document');
      
      submit(
        {
          user_prompt: inputValue || 'Please describe the content of this PDF document',
          request_type: 'pdf_analysis',
          pdf_file: pdfFile
        },
        {
          method: 'POST',
          encType: 'multipart/form-data', // Important for file uploads
          action: `/${conversationId || ''}`,
        }
      );
      
      // Reset PDF mode
      setIsPdfMode(false);
      setPdfFile(null);
    } else {
      // Regular text mode
      submit(
        {
          user_prompt: inputValue,
          request_type: 'user_prompt',
        },
        {
          method: 'POST',
          encType: 'application/x-www-form-urlencoded',
          action: `/${conversationId || ''}`,
        }
      );
    }

    inputField.current.innerHTML = '';
    handleInputChange();
  }, [handleInputChange, inputValue, navigation.state, submit, conversationId, isPdfMode, pdfFile]);

  // MAIN PART STARTS
  //motion on prompt box and it's child
  const promptFieldVariant = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        duration: 0.4,
        delay: 0.4,
        ease: [0.05, 0.7, 0.1, 1],
      },
    },
  };
  const promptFieldChildrenVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  //FUNCTION TO handle microphone click
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

  // Handle the PDF translator toggle
  const togglePdfTranslator = useCallback(() => {
    setShowPdfTranslator((prev) => !prev);
  }, []);

  // New function for handling translated PDF
  const handleTranslatedPdf = (base64PDF) => {
    if (!base64PDF) return;
    
    // Create a Blob from the base64 PDF
    try {
      const byteCharacters = atob(base64PDF);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Set the PDF file for submission
      setPdfFile(pdfBlob);
      setIsPdfMode(true);
      
      // Update the input field to indicate we're working with a PDF
      inputField.current.innerText = "What does this PDF document contain?";
      handleInputChange();
      
      // Close the translator popup
      setShowPdfTranslator(false);
      
      // Optional: Automatically submit the form with the PDF
      // handleSubmit();
    } catch (error) {
      console.error("Error processing translated PDF:", error);
    }
  };

  // Direct PDF upload without translation
  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setIsPdfMode(true);
      
      // Set a default query for the PDF
      inputField.current.innerText = "Please analyze this PDF document";
      handleInputChange();
      
      // Optional notification
      // You could add a notification here that a PDF is loaded and ready for analysis
    }
  };

  return (
    <>
      <motion.div
        className={`prompt-field-container ${isMultiline ? 'rounded-large' : ''}`}
        variants={promptFieldVariant}
        initial='hidden'
        animate='visible'
        ref={inputFieldContainer}
      >
        <motion.div
          className={`prompt-field ${placeholderShown ? '' : 'after:hidden'} ${isPdfMode ? 'pdf-mode' : ''}`}
          contentEditable={true}
          role='textbox'
          aria-multiline={true}
          aria-label='Enter a prompt here'
          data-placeholder={isPdfMode ? 'Ask a question about the PDF' : 'Enter a prompt here'}
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

        {isPdfMode && (
          <div className="pdf-indicator flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md mr-2">
            <FileText size={16} className="mr-1" />
            <span className="text-xs">PDF loaded</span>
            <button 
              className="ml-2 text-xs text-red-500" 
              onClick={() => {
                setIsPdfMode(false);
                setPdfFile(null);
              }}
            >
              ×
            </button>
          </div>
        )}

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
        <IconBtn
          icon='upload'
          title='PDF Translator'
          size='large'
          classes='ms-auto'
          variants={promptFieldChildrenVariant}
          onClick={togglePdfTranslator}
        />
        <input
          type='file'
          accept='.pdf'
          onChange={handlePdfUpload}
          style={{ display: 'none' }}
          id='pdf-upload-direct'
        />
        <IconBtn
          icon='description'
          title='Upload PDF'
          size='large'
          classes='ms-auto'
          variants={promptFieldChildrenVariant}
          onClick={() => document.getElementById('pdf-upload-direct').click()}
        />
      </motion.div>

      {/* PDF Translator popup - rendered outside the prompt field container */}
      {showPdfTranslator && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={(e) => {
            if (e.target === e.currentTarget) togglePdfTranslator();
          }}
        >
          <div className='absolute max-w-md w-full transform transition-all scale-95 animate-in fade-in duration-200'>
            <div className='rounded-lg shadow-lg overflow-hidden'>
              <div
                className='p-1'
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <button
                  className='absolute top-2 right-2 rounded-full p-1 text-white hover:bg-black hover:bg-opacity-20'
                  onClick={togglePdfTranslator}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M18 6 6 18'></path>
                    <path d='m6 6 12 12'></path>
                  </svg>
                </button>
              </div>
              <div className='theme-aware-pdf-translator'>
                <PdfTranslator
                  onTranslationComplete={handleTranslatedPdf}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS to make the PdfTranslator match our theme */}
      <style jsx>{`
        .theme-aware-pdf-translator :global(.bg-blue-500) {
          background-color: var(--primary) !important;
        }
        .theme-aware-pdf-translator :global(.bg-blue-600) {
          background-color: var(--primaryContainer) !important;
        }
        .theme-aware-pdf-translator :global(.bg-green-500) {
          background-color: var(--secondary) !important;
        }
        .theme-aware-pdf-translator :global(.bg-green-600) {
          background-color: var(--secondaryContainer) !important;
        }
        .theme-aware-pdf-translator :global(.bg-white) {
          background-color: var(--surface) !important;
          color: var(--onSurface) !important;
        }
        .theme-aware-pdf-translator :global(.border-gray-300) {
          border-color: var(--outline) !important;
        }
        .theme-aware-pdf-translator :global(.text-gray-500),
        .theme-aware-pdf-translator :global(.text-gray-700) {
          color: var(--onSurfaceVariant) !important;
        }
        .theme-aware-pdf-translator :global(.shadow-md) {
          box-shadow:
            0 4px 6px -1px var(--shadow),
            0 2px 4px -1px var(--shadow);
        }
      `}</style>
    </>
  );
};

export default PromptField;