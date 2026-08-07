import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, addChatMessage, setLoading } from '../features/complaintSlice';
import { Send, Upload, Bot, User, ShieldAlert, AlertTriangle, AlertCircle, Info, Tag } from 'lucide-react';

const AssistantPanel = () => {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef(null);
  
  const dispatch = useDispatch();
  const chatHistory = useSelector(state => state.complaint.chatHistory);
  const formData = useSelector(state => state.complaint.formData);
  const loading = useSelector(state => state.complaint.loading);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    
    const message = inputValue;
    setInputValue('');
    dispatch(addChatMessage({ role: 'user', content: message }));
    dispatch(setLoading(true));
    
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, current_form_data: formData })
      });
      
      const data = await response.json();
      
      if (data.form_data) {
        dispatch(updateFormData(data.form_data));
      }
      
      dispatch(addChatMessage({
        role: 'assistant',
        content: 'I have updated the form based on your input.',
        riskAssessment: data.risk_assessment,
        toolUsed: data.tool_used
      }));
    } catch (error) {
      dispatch(addChatMessage({ role: 'assistant', content: `Error: ${error.message}` }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    dispatch(addChatMessage({ role: 'user', content: `Uploaded document: ${file.name}` }));
    dispatch(setLoading(true));
    
    const formDataPayload = new FormData();
    formDataPayload.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/upload-document', {
        method: 'POST',
        body: formDataPayload
      });
      
      const data = await response.json();
      
      if (data.form_data) {
        dispatch(updateFormData(data.form_data));
      }
      
      dispatch(addChatMessage({
        role: 'assistant',
        content: 'I have extracted details from the document and updated the form.',
        riskAssessment: data.risk_assessment,
        toolUsed: data.tool_used
      }));
    } catch (error) {
      dispatch(addChatMessage({ role: 'assistant', content: `Error uploading document: ${error.message}` }));
    } finally {
      dispatch(setLoading(false));
      e.target.value = null; // Reset input
    }
  };

  const getRiskStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <ShieldAlert className="w-4 h-4 text-red-600" /> };
      case 'high': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: <AlertTriangle className="w-4 h-4 text-orange-600" /> };
      case 'medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: <AlertCircle className="w-4 h-4 text-yellow-600" /> };
      case 'low': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <Info className="w-4 h-4 text-green-600" /> };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: <Info className="w-4 h-4 text-gray-600" /> };
    }
  };

  const getToolDisplayName = (toolUsed) => {
    if (toolUsed === 'log_complaint_tool') return 'Log Tool';
    if (toolUsed === 'edit_complaint_tool') return 'Edit Tool';
    if (toolUsed === 'document_extract_tool') return 'Document Tool';
    return toolUsed;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2">
        <Bot className="w-6 h-6 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-800">AIVOA Co-pilot</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Hello! I am your AI assistant.</p>
            <p className="text-sm">Describe a complaint or upload a document.</p>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                  {msg.content}
                </div>

                {msg.toolUsed && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider ml-1">
                    <Tag className="w-3 h-3" />
                    <span>{getToolDisplayName(msg.toolUsed)}</span>
                  </div>
                )}

                {msg.riskAssessment && msg.riskAssessment.risk_level && (
                  <div className={`mt-1 p-3 rounded-xl border shadow-sm ${getRiskStyles(msg.riskAssessment.risk_level).bg} ${getRiskStyles(msg.riskAssessment.risk_level).border} min-w-[280px]`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getRiskStyles(msg.riskAssessment.risk_level).icon}
                      <span className={`font-bold text-xs uppercase tracking-wider ${getRiskStyles(msg.riskAssessment.risk_level).text}`}>
                        Risk Assessment: {msg.riskAssessment.risk_level}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-700 mb-2">
                      <span className="font-semibold block mb-0.5">Rationale:</span>
                      {msg.riskAssessment.rationale}
                    </div>
                    
                    {msg.riskAssessment.recommended_actions && msg.riskAssessment.recommended_actions.length > 0 && (
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold block mb-0.5">Actions:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {msg.riskAssessment.recommended_actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3 flex-row">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4" />
             </div>
             <div className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-sm flex items-center gap-2 shadow-sm">
                <span className="animate-pulse">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors shrink-0"
          title="Upload Document"
          disabled={loading}
        >
          <Upload className="w-5 h-5" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
        />
        
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !inputValue.trim()}
            className="bg-indigo-600 text-white rounded-full p-2.5 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPanel;
