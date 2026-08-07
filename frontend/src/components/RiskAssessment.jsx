import React from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, ShieldAlert, AlertCircle, Info } from 'lucide-react';

const RiskAssessment = () => {
  const riskAssessment = useSelector((state) => state.complaint.riskAssessment);
  const { risk_level, rationale, recommended_actions } = riskAssessment;

  if (!risk_level) return null;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className={`mt-6 rounded-xl border p-5 ${getRiskColor(risk_level)} transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        {getRiskIcon(risk_level)}
        <h3 className="font-bold text-lg">AI Copilot Risk Assessment: {risk_level.toUpperCase()}</h3>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-1 opacity-80">Rationale</h4>
        <p className="text-sm">{rationale || 'No rationale provided.'}</p>
      </div>
      
      {recommended_actions && recommended_actions.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-1 opacity-80">Recommended Actions</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {recommended_actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
