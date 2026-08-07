import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData, resetForm } from '../features/complaintSlice';
import { List, FileText } from 'lucide-react';

const ComplaintsList = ({ onSelectComplaint, onNewComplaint }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/complaints');
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRowClick = (complaint) => {
    if (complaint.raw_data) {
      // Keep existing complaint number or set from raw data if we saved it
      dispatch(resetForm());
      dispatch(updateFormData(complaint.raw_data));
      onSelectComplaint();
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
          <List className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">Saved Complaints</h1>
        </div>
        <button 
          onClick={() => {
            dispatch(resetForm());
            onNewComplaint();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium shadow-sm text-sm"
        >
          + New Complaint
        </button>
      </div>
      
      <div className="p-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No complaints saved yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product & Batch</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => handleRowClick(c)}
                  className="hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{c.id}</div>
                    <div className="text-xs text-gray-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{c.product_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Batch: {c.batch_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${c.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' : 
                        c.severity?.toLowerCase() === 'major' ? 'bg-orange-100 text-orange-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {c.severity || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {c.description || 'No description'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ComplaintsList;
