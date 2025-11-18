import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UpdateNotification } from "@/components/UpdateNotification";
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
import Index from "./pages/Index";
import IntegrationConsents from "./pages/IntegrationConsents";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ApiDocs } from "./pages/ApiDocs";
import { TokenGenerator } from "./pages/TokenGenerator";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminOrganizations } from "./pages/AdminOrganizations";
import { AdminPartners } from "./pages/AdminPartners";
import { AdminUsers } from "./pages/AdminUsers";
import { HospitalPanel } from "./pages/HospitalPanel";
import { HospitalMessaging } from "./pages/HospitalMessaging";
import { AdminSetup } from "./pages/AdminSetup";
import Changelog from "./pages/Changelog";
import { AdminPushNotifications } from "./pages/AdminPushNotifications";
import HealthChat from "./pages/HealthChat";
import { AdminCosts } from "./pages/AdminCosts";
import { AdminStorageManagement } from "./pages/AdminStorageManagement";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientRecord from "./pages/PatientRecord";
import AdminDoctors from "./pages/AdminDoctors";
import { DoctorPatients } from "./pages/DoctorPatients";
import { DoctorPatientDetail } from "./pages/DoctorPatientDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UpdateNotification />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
          <Route path="/changelog" element={<ProtectedRoute><Changelog /></ProtectedRoute>} />
          <Route path="/medico-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute><AdminOrganizations /></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute><AdminPartners /></ProtectedRoute>} />
          <Route path="/admin/push-notifications" element={<ProtectedRoute><AdminPushNotifications /></ProtectedRoute>} />
          <Route path="/admin/costs" element={<ProtectedRoute><AdminCosts /></ProtectedRoute>} />
          <Route path="/admin/storage" element={<ProtectedRoute><AdminStorageManagement /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute><AdminDoctors /></ProtectedRoute>} />
          <Route path="/hospital" element={<ProtectedRoute><HospitalPanel /></ProtectedRoute>} />
          <Route path="/paciente/:id" element={<ProtectedRoute><PatientRecord /></ProtectedRoute>} />
          <Route path="/hospital/messaging" element={<ProtectedRoute><HospitalMessaging /></ProtectedRoute>} />
          <Route path="/medico-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/patient/:patientId" element={<ProtectedRoute><DoctorPatientDetail /></ProtectedRoute>} />
          <Route path="/health-chat" element={<ProtectedRoute><HealthChat /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
