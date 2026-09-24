import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined, SafetyCertificateFilled } from "@ant-design/icons";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAdmin } from "../api/auth";
import type { LoginRequest } from "../types/api";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as admin, redirect directly to dashboard
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const tokenData = await loginAdmin(values);
      login(tokenData.access_token, tokenData.user);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
      ) {
        setErrorMessage(
          (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            "Authentication failed. Please check credentials."
        );
      } else {
        setErrorMessage("An unexpected error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
          borderRadius: 12,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <SafetyCertificateFilled style={{ fontSize: 44, color: "#1677ff" }} />
            <Title level={2} style={{ margin: "12px 0 4px 0" }}>
              ProcureX Admin
            </Title>
            <Text type="secondary">Enterprise Business Verification Platform</Text>
          </div>

          {errorMessage && (
            <Alert
              message="Access Denied"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
            />
          )}

          <Form
            name="admin_login"
            layout="vertical"
            initialValues={{
              email: "admin@procurex.com",
              password: "",
            }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              label="Admin Email"
              rules={[
                { required: true, message: "Please input your email address!" },
                { type: "email", message: "Please enter a valid email address!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="admin@procurex.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Enter password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Log In to Admin Portal
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", fontSize: 13, color: "#8c8c8c" }}>
              Default credentials: <br />
              <code>admin@procurex.com</code> / <code>Admin@123456</code>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
