import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar';
import HeroSection from './components/HeroSection';
import CropDiseaseDiagnosis from './components/CropDiseaseDiagnosis';
import MarketPrices from './components/MarketPrices';
import VoiceAssistant from './components/VoiceAssistant';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Schemes from './components/Schemes';
import Documents from './components/Documents';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Footer from './components/Footer';
import './styles/global.css';
import './App.css';
import VerifyOTPModal from './components/VerifyOTPModal';
import { Mic } from 'lucide-react';
import { startFakeHotwordDetection, stopFakeHotwordDetection, grantSpeechSynthesisPermission, isSpeechSynthesisPermissionGranted } from './agent/PorcupineHotword';
import AgentController from './components/AgentController';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [agentListening, setAgentListening] = useState(false);
  const [speechPermissionGranted, setSpeechPermissionGranted] = useState(false);
  const agentActiveRef = useRef(false);

  const openLoginModal = () => {
    setShowLogin(true);
    setShowRegister(false);
    setShowOTP(false);
  };
  
  const openRegisterModal = () => {
    setShowRegister(true);
    setShowLogin(false);
    setShowOTP(false);
  };
  
  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowOTP(false);
  };

  // Handler to show OTP modal after registration
  const handleRegistrationSuccess = (email) => {
    console.log('handleRegistrationSuccess called with email:', email);
    setShowRegister(false);
    setShowOTP(true);
    setOtpEmail(email);
  };

  // Cleanup agent when Voice Assistant closes
  const handleCloseVoiceAssistant = () => {
    setShowVoiceAssistant(false);
    setAgentListening(false);
    agentActiveRef.current = false;
    stopFakeHotwordDetection();
  };

  // Grant speech synthesis permission on any user interaction
  const handleUserInteraction = () => {
    if (!speechPermissionGranted && window.speechSynthesis) {
      const granted = grantSpeechSynthesisPermission();
      setSpeechPermissionGranted(granted);
    }
  };

  // Check initial permission status
  useEffect(() => {
    const initialPermission = isSpeechSynthesisPermissionGranted();
    setSpeechPermissionGranted(initialPermission);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AgentController />
        <div className="App" onClick={handleUserInteraction}>
          <Navbar openLoginModal={openLoginModal} openRegisterModal={openRegisterModal} />
          
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <>
                    <HeroSection 
                      openLoginModal={openLoginModal} 
                      openRegisterModal={openRegisterModal} 
                    />
                    <Footer />
                  </>
                } 
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile openLoginModal={openLoginModal} />} />
              <Route path="/crop-disease" element={<CropDiseaseDiagnosis />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/voice-assistant" element={<VoiceAssistant fullPage={true} />} />
            </Routes>
          </main>

          {/* Floating Mic Button */}
          <button
            className={`mic-fab${agentListening ? ' listening' : ''}`}
            aria-label={agentListening ? 'Agent Listening...' : 'Activate Agent'}
            onClick={() => {
              // Grant speech synthesis permission on user interaction
              const granted = grantSpeechSynthesisPermission();
              setSpeechPermissionGranted(granted);
              
              if (granted) {
                console.log('[App] Speech synthesis permission granted');
              } else {
                console.log('[App] Failed to grant speech synthesis permission');
              }
              
              setAgentListening(true);
              // Optionally, show a toast or indicator that agent is listening
            }}
            style={{ background: '#000000', color: 'white' }}
          >
            <Mic size={28} color="#000000" />
          </button>
          
          {/* Speech Permission Indicator */}
          {!speechPermissionGranted && (
            <div style={{
              position: 'fixed',
              bottom: '100px',
              right: '20px',
              background: '#fef3c7',
              color: '#92400e',
              padding: '10px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '300px',
              zIndex: 1000,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              💡 Click the mic button to enable voice responses
            </div>
          )}
          {/* Voice Assistant Modal */}
          {showVoiceAssistant && (
            <div className="va-modal-overlay">
              <VoiceAssistant onClose={handleCloseVoiceAssistant} />
            </div>
          )}
          {/* Modals */}
          {showLogin && <LoginModal onClose={closeModals} onSwitch={openRegisterModal} />}
          {showRegister && <RegisterModal onClose={closeModals} onSwitch={openLoginModal} onSuccess={handleRegistrationSuccess} />}
          {showOTP && <VerifyOTPModal onClose={closeModals} defaultEmail={otpEmail} />}
          
          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="!bg-white !text-neutral-900 !border !border-neutral-200 !shadow-lg"
            style={{ zIndex: 9999 }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
