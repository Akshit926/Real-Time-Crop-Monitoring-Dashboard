import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AlertTicker from './components/AlertTicker';
import Chatbot from './components/Chatbot';

// Pages
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import FarmMap from './pages/FarmMap';
import Analytics from './pages/Analytics';
import FieldJournal from './pages/FieldJournal';
import DiseaseLibrary from './pages/DiseaseLibrary';
import TaskManager from './pages/TaskManager';
import SoilHealth from './pages/SoilHealth';


import './index.css';

function App() {
  return (
    <div className="app-layout">
      {/* Real-time Alert Banner */}
      <AlertTicker />
      
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Page Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/farm-map" element={<FarmMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/soil-health" element={<SoilHealth />} />
          <Route path="/journal" element={<FieldJournal />} />
          <Route path="/library" element={<DiseaseLibrary />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Floating AI Assistant */}
      <Chatbot />
    </div>
  );
}

export default App;
