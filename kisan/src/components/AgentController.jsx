import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startFakeHotwordDetection, stopFakeHotwordDetection, grantSpeechSynthesisPermission } from '../agent/PorcupineHotword';
import AgentStatusIndicator from './AgentStatusIndicator';

export default function AgentController() {
  const navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState('idle'); // idle, listening, thinking, speaking

  useEffect(() => {
    const handleAgentAction = (action, payload) => {
      if (action === 'dashboard') navigate('/dashboard');
      if (action === 'profile') navigate('/profile');
      if (action === 'home') navigate('/');
      if (action === 'market') navigate('/market-prices');
      if (action === 'schemes') navigate('/schemes');
      if (action === 'documents') navigate('/documents');
      if (action === 'crop-disease') navigate('/crop-disease');
      if (action === 'voice-assistant') navigate('/voice-assistant');
      if (action === 'search' && payload) navigate(`/search?q=${encodeURIComponent(payload)}`);
      // Add more actions as needed
    };

    // Start hotword detection without trying to initialize speech synthesis automatically
    startFakeHotwordDetection(handleAgentAction, setAgentStatus);

    return () => {
      stopFakeHotwordDetection();
    };
  }, [navigate]);

  return <AgentStatusIndicator status={agentStatus} />;
} 