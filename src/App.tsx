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
import { Medications } from "./pages/Medications";
import { Telemedicine } from "./pages/Telemedicine";
import IntegrationConsents from "./pages/IntegrationConsents";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ApiDocs } from "./pages/ApiDocs";
import { TokenGenerator } from "./pages/TokenGenerator";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminOrganizations } from "./pages/AdminOrganizations";
import { AdminPartners } from "./pages/AdminPartners";
import { HospitalPanel } from "./pages/HospitalPanel";
import { AdminSetup } from "./pages/AdminSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/consultas" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/exames" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/contato" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sinais-vitais" element={<ProtectedRoute><VitalSigns /></ProtectedRoute>} />
          <Route path="/medicamentos" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
          <Route path="/telemedicina" element={<ProtectedRoute><Telemedicine /></ProtectedRoute>} />
          <Route path="/integracoes" element={<ProtectedRoute><IntegrationConsents /></ProtectedRoute>} />
          <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
          <Route path="/token-generator" element={<ProtectedRoute><TokenGenerator /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute><AdminOrganizations /></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute><AdminPartners /></ProtectedRoute>} />
          <Route path="/hospital" element={<ProtectedRoute><HospitalPanel /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
