from dotenv import load_dotenv
load_dotenv()
from typing import TypedDict, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
import json
import re
import os

def safe_parse(text: str) -> dict:
    # strip markdown fences if model adds them
    text = re.sub(r'```json|```', '', text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}

class AgentState(TypedDict):
    messages: list[BaseMessage]
    form_data: Dict[str, Any]
    current_tool: Optional[str]

# Initialize the ChatGroq model
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY", ""),
    temperature=0
)

# Tool 1: Log Complaint Tool
def log_complaint_tool(state: AgentState) -> dict:
    """Extract fields from natural language text to populate the form."""
    system_prompt = """You are a pharmaceutical complaint intake specialist. Extract these fields from the text and return ONLY valid JSON:
{
  "product_name": null,
  "strength": null,
  "batch_number": null,
  "manufacturing_date": null,
  "expiry_date": null,
  "complaint_date": null,
  "complainant_name": null,
  "complainant_contact": null,
  "complaint_category": null,
  "complaint_description": null,
  "quantity_affected": null,
  "severity": "Critical|Major|Minor",
  "risk_assessment": {
    "risk_level": "Low|Medium|High|Critical",
    "rationale": null,
    "recommended_actions": []
  }
}
If a field is missing use null. Do not include markdown formatting like ```json in the output, just the raw JSON object."""
    
    last_message = state["messages"][-1].content
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=last_message)
    ]
    
    response = llm.invoke(messages)
    extracted_data = safe_parse(response.content)
        
    return {"form_data": extracted_data, "current_tool": "log_complaint_tool"}

# Tool 2: Edit Complaint Tool
def edit_complaint_tool(state: AgentState) -> dict:
    """Edit specific fields of the complaint form."""
    system_prompt = f"""You are editing an existing pharmaceutical complaint form. The current form data is provided as JSON:
{json.dumps(state.get("form_data", {}), indent=2)}

Apply ONLY the requested change from the user's message and return the complete updated form JSON.
Do not change any fields not mentioned in the edit instruction. Preserve all existing risk assessment data unless explicitly asked to update it.
Return ONLY valid JSON. Do not include markdown formatting like ```json in the output, just the raw JSON object."""

    last_message = state["messages"][-1].content
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=last_message)
    ]
    
    response = llm.invoke(messages)
    updated_data = safe_parse(response.content)
    if not updated_data:
        updated_data = state.get("form_data", {})
        
    return {"form_data": updated_data, "current_tool": "edit_complaint_tool"}

# Tool 3: Document Extract Tool
def document_extract_tool(state: AgentState) -> dict:
    """Extract complaint fields from a document text."""
    system_prompt = """Extract pharmaceutical complaint data from this document (PDF or email).
Return the same JSON structure as log_complaint_tool. Be thorough — documents may contain tables, headers, or unstructured text.
Return ONLY valid JSON. Do not include markdown formatting like ```json in the output, just the raw JSON object.
{
  "product_name": null,
  "strength": null,
  "batch_number": null,
  "manufacturing_date": null,
  "expiry_date": null,
  "complaint_date": null,
  "complainant_name": null,
  "complainant_contact": null,
  "complaint_category": null,
  "complaint_description": null,
  "quantity_affected": null,
  "severity": "Critical|Major|Minor",
  "risk_assessment": {
    "risk_level": "Low|Medium|High|Critical",
    "rationale": null,
    "recommended_actions": []
  }
}
If a field is missing use null."""

    last_message = state["messages"][-1].content
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=last_message)
    ]
    
    response = llm.invoke(messages)
    extracted_data = safe_parse(response.content)
        
    return {"form_data": extracted_data, "current_tool": "document_extract_tool"}

# Router function to decide which tool to call
def router(state: AgentState) -> str:
    """Determine the intent of the user and route to the appropriate tool."""
    last_message = state["messages"][-1].content
    
    # Simple routing logic based on prompt keywords, or you could use another LLM call to classify intent
    # For this implementation, we will use an LLM call to determine intent to make it robust
    intent_prompt = """Analyze the user message and classify the intent into one of three categories:
1. "log": The user is describing a new complaint in natural language.
2. "edit": The user is providing instructions to change, update, or edit an existing complaint form.
3. "document": The user has uploaded or pasted a full document/email/PDF text to be extracted.

Return ONLY the word "log", "edit", or "document"."""
    
    messages = [
        SystemMessage(content=intent_prompt),
        HumanMessage(content=last_message)
    ]
    
    response = llm.invoke(messages)
    intent = response.content.strip().lower()
    
    if "edit" in intent:
        return "edit_complaint_tool"
    elif "document" in intent:
        return "document_extract_tool"
    else:
        return "log_complaint_tool"

# Build the LangGraph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("log_complaint_tool", log_complaint_tool)
workflow.add_node("edit_complaint_tool", edit_complaint_tool)
workflow.add_node("document_extract_tool", document_extract_tool)

# Add conditional edges from start based on intent
workflow.set_conditional_entry_point(
    router,
    {
        "log_complaint_tool": "log_complaint_tool",
        "edit_complaint_tool": "edit_complaint_tool",
        "document_extract_tool": "document_extract_tool"
    }
)

# All tools end the workflow
workflow.add_edge("log_complaint_tool", END)
workflow.add_edge("edit_complaint_tool", END)
workflow.add_edge("document_extract_tool", END)

# Compile the graph
agent_executor = workflow.compile()

def process_complaint(message: str, current_form_data: dict = None) -> dict:
    """Main entry point for the API to call the agent."""
    initial_state = {
        "messages": [HumanMessage(content=message)],
        "form_data": current_form_data or {},
        "current_tool": None
    }
    
    result = agent_executor.invoke(initial_state)
    return {
        "form_data": result.get("form_data", {}),
        "tool_used": result.get("current_tool")
    }
