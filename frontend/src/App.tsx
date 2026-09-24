import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BusinessesPage } from "./pages/BusinessesPage";
import { BusinessDetailPage } from "./pages/BusinessDetailPage";
import { ComplaintsPage } from "./pages/ComplaintsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#2563eb",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            colorText: "#0f172a",
            colorTextSecondary: "#64748b",
            colorBorder: "#e2e8f0",
            colorBgLayout: "#f1f3f6",
          },
          components: {
            Card: {
              paddingLG: 16,
              boxShadowTertiary: "none",
              colorBorderSecondary: "#e2e8f0",
            },
            Table: {
              cellPaddingBlock: 8,
              cellPaddingInline: 12,
              headerBg: "#f8fafc",
              headerColor: "#475569",
              rowHoverBg: "#f8fafc",
              borderColor: "#e2e8f0",
            },
            Button: {
              controlHeight: 32,
              borderRadius: 6,
            },
          },
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/businesses" element={<BusinessesPage />} />
                  <Route
                    path="/businesses/:id"
                    element={<BusinessDetailPage />}
                  />
                  <Route path="/complaints" element={<ComplaintsPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
