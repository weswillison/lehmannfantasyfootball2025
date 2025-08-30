import React, { useState, useEffect } from 'react';
import { api, ScoringRules as Rules } from '../api';
import './ScoringRules.css';

const ScoringRules: React.FC = () => {
  const [rules, setRules] = useState<Rules | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const rulesData = await api.getScoringRules();
        setRules(rulesData);
      } catch (error) {
        console.error('Failed to load rules:', error);
      }
    };

    loadRules();
  }, []);

  if (!rules) return null;

  return (
    <div className="scoring-rules">
      <button 
        className="rules-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        📋 Scoring Rules {expanded ? '▲' : '▼'}
      </button>
      
      {expanded && (
        <div className="rules-content">
          <ul>
            {rules.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScoringRules;