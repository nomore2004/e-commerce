import React from "react";
import { Layout, Menu, Button, Typography, Space, theme } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AlertOutlined,
  HistoryOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/businesses",
      icon: <ShopOutlined />,
      label: "Businesses",
    },
    {
      key: "/complaints",
      icon: <AlertOutlined />,
      label: "Complaints",
    },
    {
      key: "/audit-logs",
      icon: <HistoryOutlined />,
      label: "Audit Logs",
    },
  ];

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine active key (exact or prefix matching for nested paths like /businesses/:id)
  const currentPath = "/" + location.pathname.split("/")[1];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="dark" breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <SafetyCertificateOutlined style={{ fontSize: 24, color: "#1677ff" }} />
          <Title level={4} style={{ color: "#fff", margin: 0, letterSpacing: 0.5 }}>
            ProcureX
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ marginTop: 12 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            Admin Verification Portal
          </Text>
          <Space size="middle">
            <Text type="secondary">
              Logged in as: <strong style={{ color: "#000" }}>{user?.full_name || "Admin"}</strong>
            </Text>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
