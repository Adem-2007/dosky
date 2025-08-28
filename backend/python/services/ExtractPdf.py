# --- START OF MODIFIED FILE services/ExtractPdf.py ---

import os
import fitz  # PyMuPDF
import camelot
import base64
import tiktoken
import tempfile  # Use for secure, temporary file handling
from flask import Blueprint, request, jsonify

# Import the new feature service
from .PdfFeature import PdfFeatureService

# --- Service Class for PDF Extraction (Optimized) ---

class PdfExtractionService:
    def __init__(self, file_stream):
        # OPTIMIZATION: Read the entire file into a memory buffer at once
        self.pdf_bytes = file_stream.read()
        self.encoding = tiktoken.get_encoding("cl100k_base")

    def extract_data(self):
        """
        Extracts data from the PDF using an efficient in-memory, single-pass approach.
        """
        # --- ADDED: Use the new PdfFeatureService to get the page count ---
        feature_service = PdfFeatureService(self.pdf_bytes)
        page_count = feature_service.get_page_count()
        # --- END OF ADDITION ---

        # OPTIMIZATION: Open the PDF directly from the in-memory byte stream
        doc = fitz.open(stream=self.pdf_bytes, filetype="pdf")

        text_content_parts = []
        images_data = []
        total_token_count = 0

        # OPTIMIZATION: Single-pass loop through the document
        # We extract text, images, and calculate tokens in one go.
        for page in doc:
            # 1. Extract text from the current page
            page_text = page.get_text()
            text_content_parts.append(page_text)

            # 2. Incrementally encode and count tokens to save memory
            total_token_count += len(self.encoding.encode(page_text))

            # 3. Extract images from the current page
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                images_data.append(f"data:image/{image_ext};base64,{base64_image}")
        
        doc.close()

        # Join the text parts after the loop is complete
        full_text_content = "".join(text_content_parts)

        # For Camelot, we still need a file path, so we use a temporary file
        tables_content = self._extract_tables_from_bytes()

        return {
            "text": full_text_content,
            "tokenCount": total_token_count,
            "pageCount": page_count, # --- ADDED: Include page count in the result ---
            "tables": tables_content,
            "images": images_data
        }

    def _extract_tables_from_bytes(self):
        """
        Extracts tables by writing the in-memory bytes to a temporary file for Camelot.
        """
        tables_data = []
        # OPTIMIZATION: Use a temporary file that is automatically cleaned up
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as temp_pdf:
            temp_pdf.write(self.pdf_bytes)
            temp_pdf.flush() # Ensure all data is written to the file

            try:
                tables = camelot.read_pdf(temp_pdf.name, pages='all', flavor='stream')
                for table in tables:
                    tables_data.append({
                        "page": table.page,
                        "data": table.df.values.tolist()
                    })
            except Exception as e:
                print(f"Could not extract tables with Camelot: {e}")
        return tables_data


# --- Router (Blueprint) for PDF Operations ---
extract_pdf_bp = Blueprint('extract_pdf', __name__)

@extract_pdf_bp.route('/upload', methods=['POST'])
def upload_and_extract_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file and file.filename.endswith('.pdf'):
        try:
            # OPTIMIZATION: Pass the file stream directly to the service
            extractor_service = PdfExtractionService(file)
            extracted_data = extractor_service.extract_data()
            
            return jsonify({
                "message": "File processed successfully",
                "data": extracted_data
            }), 200
        except Exception as e:
            # Add more specific error logging
            print(f"Error during PDF processing: {e}")
            return jsonify({"error": f"An error occurred during processing: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file type, only PDF is allowed"}), 400

# --- END OF MODIFIED FILE ---