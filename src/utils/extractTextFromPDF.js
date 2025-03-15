const extractTextFromPdf = async (base64PdfString) => {
    try {
        // Convert base64 to array buffer
        const binaryString = atob(base64PdfString);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Load PDF.js (you'll need to add this to your dependencies)
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        
        // Extract text from all pages
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            textContent += strings.join(' ') + '\n';
        }
        
        return textContent;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        return "Error extracting text from PDF";
    }
};

export default extractTextFromPdf;