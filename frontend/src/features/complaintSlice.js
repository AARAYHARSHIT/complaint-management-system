import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    complaint_number: `CMP-${Math.floor(10000 + Math.random() * 90000)}`,
    product_name: '',
    strength: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    complaint_date: '',
    complainant_name: '',
    complainant_contact: '',
    complaint_category: '',
    complaint_description: '',
    quantity_affected: '',
    severity: '',
  },
  chatHistory: [],
  riskAssessment: {},
  loading: false,
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...Object.fromEntries(
          Object.entries(action.payload).filter(([_, v]) => v !== null && v !== undefined)
        ),
      };
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    updateRiskAssessment: (state, action) => {
      state.riskAssessment = action.payload || {};
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetForm: () => ({
      ...initialState,
      formData: {
        ...initialState.formData,
        complaint_number: `CMP-${Math.floor(10000 + Math.random() * 90000)}`,
      }
    }),
  },
});

export const { updateFormData, addChatMessage, updateRiskAssessment, setLoading, resetForm } = complaintSlice.actions;

export default complaintSlice.reducer;
