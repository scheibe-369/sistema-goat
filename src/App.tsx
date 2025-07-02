
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { CRMLayout } from "./components/Layout/CRMLayout";
import Dashboard from "./pages/Dashboard";
import LeadsKanban from "./pages/LeadsKanban";
import Contracts from "./pages/Contracts";
import Financial from "./pages/Financial";
import Conversations from "./pages/Conversations";
import Clients from "./pages/Clients";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-goat-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-goat-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route path="/" element={
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
