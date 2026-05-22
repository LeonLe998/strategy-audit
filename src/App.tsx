import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingZalo from './components/FloatingZalo';
import LandingPage from './pages/LandingPage';
import IntakeWizard from './pages/IntakeWizard';
import ClientDashboard from './pages/ClientDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-['Be_Vietnam_Pro',_sans-serif] bg-[#0B0E14] text-gray-200">
        <Navbar />
        <FloatingZalo />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/intake" element={<IntakeWizard />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
