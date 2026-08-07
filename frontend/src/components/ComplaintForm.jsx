import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormData, resetForm } from '../features/complaintSlice';

const ComplaintForm = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.complaint.formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Complaint saved successfully!');
      } else {
        alert('Failed to save complaint.');
      }
    } catch (error) {
      alert('Error saving complaint: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h1 className="text-xl font-bold text-gray-800">Log Customer Complaint</h1>
        <div className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded">
          {formData.complaint_number}
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Name</label>
            <input type="text" name="product_name" value={formData.product_name || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Strength/Grade</label>
            <input type="text" name="strength" value={formData.strength || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Batch Number</label>
            <input type="text" name="batch_number" value={formData.batch_number || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Quantity Affected</label>
            <input type="text" name="quantity_affected" value={formData.quantity_affected || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mfg Date</label>
            <input type="date" name="manufacturing_date" value={formData.manufacturing_date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Exp Date</label>
            <input type="date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Complaint Date</label>
            <input type="date" name="complaint_date" value={formData.complaint_date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Complainant Name</label>
            <input type="text" name="complainant_name" value={formData.complainant_name || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Complainant Contact</label>
            <input type="text" name="complainant_contact" value={formData.complainant_contact || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Complaint Category</label>
            <select name="complaint_category" value={formData.complaint_category || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="">Select...</option>
              <option value="Quality">Quality</option>
              <option value="Packaging">Packaging</option>
              <option value="Adverse Event">Adverse Event</option>
              <option value="Medical Inquiry">Medical Inquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Severity</label>
            <select name="severity" value={formData.severity || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="">Select...</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Complaint Description</label>
          <textarea name="complaint_description" value={formData.complaint_description || ''} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-auto">
        <button onClick={() => dispatch(resetForm())} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-medium">Reset</button>
        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm">Save Complaint</button>
      </div>
    </div>
  );
};

export default ComplaintForm;
