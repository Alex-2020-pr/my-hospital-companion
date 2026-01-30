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
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
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
import { DoctorSchedule } from "./pages/DoctorSchedule";
import { DoctorPrescription } from "./pages/DoctorPrescription";
import { DoctorExamRequest } from "./pages/DoctorExamRequest";
import { DoctorTelemedicine } from "./pages/DoctorTelemedicine";
import NursingDashboard from "./pages/NursingDashboard";
import NursingDashboardMobile from "./pages/NursingDashboardMobile";
import NursingVitalSigns from "./pages/NursingVitalSigns";
import NursingVitalSignsMobile from "./pages/NursingVitalSignsMobile";
import NursingEvolution from "./pages/NursingEvolution";
import NursingProcedures from "./pages/NursingProcedures";
import NursingIncidents from "./pages/NursingIncidents";
import NursingEvolutionMobile from "./pages/NursingEvolutionMobile";
import NursingHistoryMobile from "./pages/NursingHistoryMobile";
import NursingPatientHistory from "./pages/NursingPatientHistory";
import { NursingMedications } from "./pages/NursingMedications";
import { NursingFluidBalance } from "./pages/NursingFluidBalance";
import { NursingShiftHandover } from "./pages/NursingShiftHandover";
import PortalSelection from "./pages/PortalSelection";
import LandingPortal from "./pages/LandingPortal";
import MedicalCalculators from "./pages/MedicalCalculators";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UpdateNotification />
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Landing page is portal selection */}
          <Route path="/" element={<LandingPortal />} />
          <Route path="/welcome" element={<LandingPortal />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          
          {/* Portal Selection (for logged users with multiple roles) */}
          <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/portal" element={<ProtectedRoute><PortalSelection /></ProtectedRoute>} />
          
          {/* Patient Portal Routes */}
          <Route path="/dashboard" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Dashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/consultas" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Appointments />
            </RoleProtectedRoute>
          } />
          <Route path="/exames" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Exams />
            </RoleProtectedRoute>
          } />
          <Route path="/documentos" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Documents />
            </RoleProtectedRoute>
          } />
          <Route path="/contato" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Communication />
            </RoleProtectedRoute>
          } />
          <Route path="/sinais-vitais" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <VitalSigns />
            </RoleProtectedRoute>
          } />
          <Route path="/medicamentos" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Medications />
            </RoleProtectedRoute>
          } />
          <Route path="/telemedicina" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <Telemedicine />
            </RoleProtectedRoute>
          } />
          <Route path="/integracoes" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <IntegrationConsents />
            </RoleProtectedRoute>
          } />
          <Route path="/health-chat" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <HealthChat />
            </RoleProtectedRoute>
          } />
          
          {/* Doctor Portal Routes */}
          <Route path="/medico-dashboard" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatients />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/patient/:patientId" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatientDetail />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorSchedule />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/prescription" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorPrescription />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/exam-request" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorExamRequest />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/telemedicine" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <DoctorTelemedicine />
            </RoleProtectedRoute>
          } />
          <Route path="/doctor/calculators" element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <MedicalCalculators />
            </RoleProtectedRoute>
          } />
          <Route path="/paciente/:id" element={
            <RoleProtectedRoute allowedRoles={['doctor', 'nurse', 'nursing_tech']}>
              <PatientRecord />
            </RoleProtectedRoute>
          } />
          
          {/* Nursing Portal Routes */}
          <Route path="/nursing" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingDashboardMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/dashboard-mobile" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingDashboardMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/vital-signs" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingVitalSignsMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/vital-signs-mobile" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingVitalSignsMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/evolution" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingEvolution />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/evolution-mobile" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingEvolutionMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/procedures" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingProcedures />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/incidents" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingIncidents />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/history-mobile" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingHistoryMobile />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/patient/:patientId" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingPatientHistory />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/medications" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingMedications />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/fluid-balance" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingFluidBalance />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/shift-handover" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <NursingShiftHandover />
            </RoleProtectedRoute>
          } />
          <Route path="/nursing/calculators" element={
            <RoleProtectedRoute allowedRoles={['nurse', 'nursing_tech']}>
              <MedicalCalculators />
            </RoleProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
              <AdminUsers />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/organizations" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminOrganizations />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/partners" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminPartners />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/push-notifications" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminPushNotifications />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/costs" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminCosts />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/storage" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminStorageManagement />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
              <AdminDoctors />
            </RoleProtectedRoute>
          } />
          <Route path="/hospital" element={
            <RoleProtectedRoute allowedRoles={['hospital_admin']}>
              <HospitalPanel />
            </RoleProtectedRoute>
          } />
          <Route path="/hospital/messaging" element={
            <RoleProtectedRoute allowedRoles={['hospital_admin']}>
              <HospitalMessaging />
            </RoleProtectedRoute>
          } />
          
          {/* Shared Routes (require authentication but no specific role) */}
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
          <Route path="/token-generator" element={<ProtectedRoute><TokenGenerator /></ProtectedRoute>} />
          <Route path="/changelog" element={<ProtectedRoute><Changelog /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
