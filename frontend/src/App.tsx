import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreditDataProvider } from './hooks/useCreditData';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DataIngestor } from './pages/DataIngestor';
import { ResearchAgent } from './pages/ResearchAgent';
import { CAMPreview } from './pages/CAMPreview';
import { ClientDashboard } from './pages/ClientDashboard';
import { Pipeline } from './pages/Pipeline';

function App() {
  return (
    <CreditDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/ingestor" element={<DataIngestor />} />
            <Route path="/risk-intel" element={<ResearchAgent />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/cam-preview" element={<CAMPreview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CreditDataProvider>
  );
}

export default App;
