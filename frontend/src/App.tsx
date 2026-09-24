import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";

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
            colorPrimary: "#1677ff",
            borderRadius: 6,
          },
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route
                path="/login"
                element={
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <h2>ProcureX Login (Placeholder for Step 4.2)</h2>
                  </div>
                }
              />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard" element={<h3>Dashboard View</h3>} />
                  <Route path="/businesses" element={<h3>Businesses View</h3>} />
                  <Route path="/businesses/:id" element={<h3>Business Details View</h3>} />
                  <Route path="/complaints" element={<h3>Complaints View</h3>} />
                  <Route path="/audit-logs" element={<h3>Audit Logs View</h3>} />
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
