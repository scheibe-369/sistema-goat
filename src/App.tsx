
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CRMLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsKanban />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/clients" element={<Clients />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CRMLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
