
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { CRMLayout } from '@/components/Layout/CRMLayout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import LeadsKanban from '@/pages/LeadsKanban';
import Conversations from '@/pages/Conversations';
import Contracts from '@/pages/Contracts';
import Financial from '@/pages/Financial';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-goat-gray-900">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<CRMLayout><Dashboard /></CRMLayout>} />
          <Route path="/clients" element={<CRMLayout><Clients /></CRMLayout>} />
          <Route path="/leads" element={<CRMLayout><LeadsKanban /></CRMLayout>} />
          <Route path="/conversations" element={<CRMLayout><Conversations /></CRMLayout>} />
          <Route path="/contracts" element={<CRMLayout><Contracts /></CRMLayout>} />
          <Route path="/financial" element={<CRMLayout><Financial /></CRMLayout>} />
          <Route path="/settings" element={<CRMLayout><Settings /></CRMLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
