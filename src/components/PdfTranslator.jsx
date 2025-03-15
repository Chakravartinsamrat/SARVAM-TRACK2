import React, { useState } from "react";
import { Pin, Download, FileUp } from "lucide-react";
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
                        "api-subscription-key": "1742b802-6774-4aec-9f2f-38d9eafac98c",
                    },
                }
            );

            console.log("Response:", response.data);

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

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">PDF Translator</h2>
            
            {!upload ? (
                <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                        <button 
                            onClick={() => setUpload(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-600 transition"
                        >
                            <FileUp size={18} />
                            <span>Upload PDF</span>
                        </button>
                        
                        {responsePDF && (
                            <button 
                                onClick={() => downloadBase64Pdf(responsePDF, fileName)}
                                className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-600 transition"
                            >
                                <Download size={18} />
                                <span>Download Translated PDF</span>
                            </button>
                        )}
                    </div>
                    
                    {responsePDF && (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                            Your PDF has been translated successfully!
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            className="w-full"
                            id="pdf-upload"
                        />
                        <label 
                            htmlFor="pdf-upload" 
                            className="block text-center text-gray-500 mt-2"
                        >
                            {fileName ? fileName : "Select a PDF file"}
                        </label>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Translation Language:
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            {languageOptions.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name} ({lang.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-between">
                        <button 
                            onClick={() => setUpload(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={Translate}
                            disabled={!pdf || isLoading}
                            className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center space-x-2 ${(!pdf || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Translating...' : 'Translate'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfTranslator;