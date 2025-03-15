import React, { useState } from "react";
import { Download, FileUp } from "lucide-react";
import axios from "axios";

const PdfTranslator = () => {
    const [upload, setUpload] = useState(false);
    const [pdf, setPdf] = useState(null);
    const [responsePDF, setResponsePDF] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("bn-IN");
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    const languageOptions = [
        { code: "hi-IN", name: "Hindi" },
        { code: "bn-IN", name: "Bengali" },
        { code: "gu-IN", name: "Gujarati" },
        { code: "kn-IN", name: "Kannada" },
        { code: "ml-IN", name: "Malayalam" },
        { code: "mr-IN", name: "Marathi" },
        { code: "od-IN", name: "Odia" },
        { code: "pa-IN", name: "Punjabi" },
        { code: "ta-IN", name: "Tamil" },
        { code: "te-IN", name: "Telugu" }
    ];

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPdf(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const Translate = async () => {
        if (!pdf) {
            console.error("No PDF file selected.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("pdf", pdf);
        formData.append("output_lang", selectedLanguage);

        try {
            const response = await axios.post(
                "https://api.sarvam.ai/parse/translatepdf",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "api-subscription-key": import.meta.env.VITE_SARVAM_API_KEY,
                    },
                }
            );

            if (response.data && response.data.translated_pdf) {
                setResponsePDF(response.data.translated_pdf);
                setUpload(false);
            } else {
                console.error("Invalid API response format:", response.data);
            }
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadBase64Pdf = (base64String, fileName) => {
        if (!base64String) {
            console.error("No base64 PDF data available.");
            return;
        }

        try {
            const byteCharacters = atob(base64String);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: "application/pdf" });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName ? `translated_${fileName}` : "translated.pdf";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        }
    };

    // Custom styles for violet theme
    const styles = {
        container: {
            backgroundColor: "var(--surface, #FCF7FF)",
            color: "var(--onSurface, #1D1B22)",
            borderRadius: "0.75rem",
            padding: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            maxWidth: "28rem",
            margin: "0 auto",
            fontFamily: "'Inter', 'Roboto', sans-serif"
        },
        title: {
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
            textAlign: "center",
            color: "var(--primary, #A033FF)"
        },
        primaryButton: {
            backgroundColor: "var(--primary, #A033FF)",
            color: "var(--onPrimary, #FFFFFF)",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            fontWeight: "500",
            fontSize: "0.875rem"
        },
        primaryButtonHover: {
            backgroundColor: "var(--primaryContainer, #7F00DE)"
        },
        secondaryButton: {
            backgroundColor: "var(--secondary, #6B4D80)",
            color: "var(--onSecondary, #FFFFFF)",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            fontWeight: "500",
            fontSize: "0.875rem"
        },
        secondaryButtonHover: {
            backgroundColor: "var(--secondaryContainer, #51376B)"
        },
        cancelButton: {
            backgroundColor: "var(--surfaceVariant, #4B4554)",
            color: "var(--onSurfaceVariant, #CEC9D6)",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            fontWeight: "500",
            fontSize: "0.875rem"
        },
        fileUploadArea: {
            border: "2px dashed var(--outline, #7C7586)",
            borderRadius: "0.375rem",
            padding: "1.5rem",
            backgroundColor: "var(--surfaceContainerLow, #F5F0FC)"
        },
        fileLabel: {
            display: "block",
            textAlign: "center",
            marginTop: "0.5rem",
            color: "var(--onSurfaceVariant, #4B4554)",
            fontSize: "0.875rem"
        },
        selectLabel: {
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--onSurface, #1D1B22)",
            marginBottom: "0.25rem"
        },
        select: {
            display: "block",
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid var(--outline, #7C7586)",
            backgroundColor: "var(--surfaceContainerLow, #F5F0FC)",
            color: "var(--onSurface, #1D1B22)",
            fontSize: "0.875rem",
            outline: "none",
            transition: "border-color 0.2s ease"
        },
        selectFocus: {
            borderColor: "var(--primary, #A033FF)",
            boxShadow: "0 0 0 2px var(--primaryContainer, #F2D6FF)"
        },
        successMessage: {
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "var(--tertiaryContainer, #E6DEFF)",
            color: "var(--onTertiaryContainer, #1D0065)",
            borderRadius: "0.375rem",
            fontSize: "0.875rem"
        },
        buttonContainer: {
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem"
        },
        disabled: {
            opacity: "0.5",
            cursor: "not-allowed"
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>PDF Translator</h2>
            
            {!upload ? (
                <div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                        <button 
                            onClick={() => setUpload(true)}
                            style={styles.primaryButton}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--primaryContainer, #7F00DE)"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--primary, #A033FF)"}
                        >
                            <FileUp size={18} />
                            <span>Upload PDF</span>
                        </button>
                        
                        {responsePDF && (
                            <button 
                                onClick={() => downloadBase64Pdf(responsePDF, fileName)}
                                style={styles.secondaryButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--secondaryContainer, #51376B)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--secondary, #6B4D80)"}
                            >
                                <Download size={18} />
                                <span>Download Translated PDF</span>
                            </button>
                        )}
                    </div>
                    
                    {responsePDF && (
                        <div style={styles.successMessage}>
                            Your PDF has been translated successfully!
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={styles.fileUploadArea}>
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            style={{ width: "100%" }}
                            id="pdf-upload"
                        />
                        <label 
                            htmlFor="pdf-upload" 
                            style={styles.fileLabel}
                        >
                            {fileName ? fileName : "Select a PDF file"}
                        </label>
                    </div>
                    
                    <div>
                        <label style={styles.selectLabel}>
                            Select Translation Language:
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            style={styles.select}
                            onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
                            onBlur={(e) => e.target.style.boxShadow = "none"}
                        >
                            {languageOptions.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name} ({lang.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={styles.buttonContainer}>
                        <button 
                            onClick={() => setUpload(false)}
                            style={styles.cancelButton}
                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={Translate}
                            disabled={!pdf || isLoading}
                            style={!pdf || isLoading ? { ...styles.primaryButton, ...styles.disabled } : styles.primaryButton}
                            onMouseOver={(e) => {
                                if (!(!pdf || isLoading)) {
                                    e.currentTarget.style.backgroundColor = "var(--primaryContainer, #7F00DE)";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!(!pdf || isLoading)) {
                                    e.currentTarget.style.backgroundColor = "var(--primary, #A033FF)";
                                }
                            }}
                        >
                            <span>{isLoading ? 'Translating...' : 'Translate'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfTranslator;