
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { CRMLayout } from "./components/Layout/CRMLayout";
import Dashboard from "./pages/Dashboard";
import LeadsKanban from "./pages/LeadsKanban";
import Contracts from "./pages/Contracts";
import Financial from "./pages/Financial";
import Conversations from "./pages/Conversations";
import Clients from "./pages/Clients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<div />} />
            <Route path="*" element={
              <ProtectedRoute>
                <CRMLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leads" element={<LeadsKanban />} />
                    <Route path="/contracts" element={<Contracts />} />
                    <Route path="/financial" element={<Financial />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </CRMLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
