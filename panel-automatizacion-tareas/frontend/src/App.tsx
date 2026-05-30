import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { AutomationsPage } from './features/automations/pages/AutomationsPage';
import { AutomationFormPage } from './features/automations/pages/AutomationFormPage';
import { ExecutionsPage } from './features/executions/pages/ExecutionsPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { AuditPage } from './features/audit/pages/AuditPage';
import { ProfilePage } from './features/settings/pages/ProfilePage';
import { AppLayout } from './shared/components/AppLayout';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { ForbiddenPage, NotFoundPage } from './shared/components/ErrorPages';

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="automations" element={<AutomationsPage />} />
            <Route path="automations/new" element={<AutomationFormPage />} />
            <Route path="automations/:id/edit" element={<AutomationFormPage />} />
            <Route path="executions" element={<ExecutionsPage />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="audit" element={<AuditPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
