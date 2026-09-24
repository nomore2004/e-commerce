import React from "react";
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AlertOutlined,
  HistoryOutlined,
  LogoutOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: "Dashboard",
    },
    {
      key: "/businesses",
      icon: <ShopOutlined style={{ fontSize: 16 }} />,
      label: "Businesses",
    },
    {
      key: "/complaints",
      icon: <AlertOutlined style={{ fontSize: 16 }} />,
      label: "Complaints",
    },
    {
      key: "/audit-logs",
      icon: <HistoryOutlined style={{ fontSize: 16 }} />,
      label: "Audit Logs",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong>{user?.full_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Active key
  const currentPath = "/" + location.pathname.split("/")[1];

  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      {/* Dark Sidebar */}
      <Sider
        width={250}
        theme="dark"
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#0d1b2a",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <SafetyCertificateFilled style={{ fontSize: 26, color: "#1677ff" }} />
          <div>
            <Title
              level={4}
              style={{
                color: "#ffffff",
                margin: 0,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              ProcureX
            </Title>
            <Text
              style={{
                color: "#8c8c8c",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Admin Portal
            </Text>
          </div>
        </div>

        {/* Sidebar Nav */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "#0d1b2a",
            marginTop: 16,
            fontSize: 14,
            fontWeight: 500,
          }}
        />
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ background: "#f5f7fa" }}>
        {/* Top Header */}
        <Header
          style={{
            padding: "0 32px",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e8e8e8",
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 4px rgba(0,21,41,0.06)",
          }}
        >
          <Text strong style={{ fontSize: 16, color: "#1f2937" }}>
            B2B Procurement & Verification Console
          </Text>

          <Space size="middle">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" style={{ height: "auto", padding: "4px 8px" }}>
                <Space align="center" size="small">
                  <Avatar
                    style={{ backgroundColor: "#1677ff" }}
                    icon={<UserOutlined />}
                  />
                  <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                      {user?.full_name || "Admin"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      Administrator
                    </div>
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* Inner Page View */}
        <Content
          style={{
            padding: "24px 32px",
            minHeight: "calc(100vh - 64px)",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
