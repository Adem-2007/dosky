import fitz  # PyMuPDF

class PdfFeatureService:
    """
    A service class to extract specific features or metadata from a PDF document
    without processing its entire content.
    """
    def __init__(self, pdf_bytes):
        """
        Initializes the service with the PDF content as a byte stream.
        
        Args:
            pdf_bytes (bytes): The raw byte content of the PDF file.
        """
        self.pdf_bytes = pdf_bytes

    def get_page_count(self):
        """
        Efficiently calculates the total number of pages in the PDF.
        
        Returns:
            int: The number of pages in the document.
        """
        try:
            # Open the PDF directly from the in-memory byte stream
            doc = fitz.open(stream=self.pdf_bytes, filetype="pdf")
            count = doc.page_count
            doc.close()
            return count
        except Exception as e:
            print(f"Could not get page count: {e}")
            return 0
