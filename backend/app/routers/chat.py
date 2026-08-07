from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import pdfplumber
import pytesseract
from PIL import Image
import io

from app.agents.complaint_agent import process_complaint

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    message: str
    current_form_data: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    result = process_complaint(request.message, request.current_form_data)
    
    form_data_result = result.get("form_data", {})
    risk_assessment = form_data_result.pop("risk_assessment", None)
    
    return {
        "form_data": form_data_result,
        "risk_assessment": risk_assessment,
        "tool_used": result.get("tool_used")
    }

@router.post("/upload-document")
async def upload_document_endpoint(file: UploadFile = File(...)):
    document_text = ""
    
    try:
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        document_text += page_text + "\n"
        elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
            image = Image.open(io.BytesIO(content))
            document_text = pytesseract.image_to_string(image)
        else:
            # Fallback for text/email files
            document_text = content.decode("utf-8", errors="ignore")
            
        if not document_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    # Create a message mimicking user intent for document extraction
    message = f"Extract details from this document:\n{document_text}"
    
    result = process_complaint(message, {})
    
    form_data_result = result.get("form_data", {})
    risk_assessment = form_data_result.pop("risk_assessment", None)
    
    return {
        "form_data": form_data_result,
        "risk_assessment": risk_assessment,
        "tool_used": result.get("tool_used")
    }
