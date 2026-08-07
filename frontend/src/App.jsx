import React, { useState } from 'react';
import ComplaintForm from './components/ComplaintForm';
import AssistantPanel from './components/AssistantPanel';
import ComplaintsList from './components/ComplaintsList';
import { List, PlusCircle } from 'lucide-react';

function App() {
  const [view, setView] = useState('form'); // 'form' or 'list'

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      
      {/* Navigation Bar */}
      <div className="mb-6 flex justify-end gap-4">
        {view === 'form' ? (
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm font-medium"
          >
            <List className="w-4 h-4" /> View All Complaints
          </button>
        ) : (
          <button 
            onClick={() => setView('form')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" /> New Complaint
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="w-full h-[calc(100vh-120px)]">
          <ComplaintsList 
            onSelectComplaint={() => setView('form')} 
            onNewComplaint={() => setView('form')}
          />
        </div>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* LEFT PANEL - Form */}
          <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <ComplaintForm />
          </div>

          {/* RIGHT PANEL - Assistant */}
          <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <AssistantPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
