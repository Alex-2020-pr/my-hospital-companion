import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Appointments } from "./pages/Appointments";
import { Exams } from "./pages/Exams";
import { Documents } from "./pages/Documents";
import { Communication } from "./pages/Communication";
import { Profile } from "./pages/Profile";
import { VitalSigns } from "./pages/VitalSigns";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/consultas" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/exames" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/contato" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sinais-vitais" element={<ProtectedRoute><VitalSigns /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
