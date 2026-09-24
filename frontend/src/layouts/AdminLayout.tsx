import { Layout, Button, Typography, Space, Avatar, Dropdown } from "antd";
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
const { Text } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined style={{ fontSize: 15 }} />,
      label: "Dashboard",
    },
    {
      key: "/businesses",
      icon: <ShopOutlined style={{ fontSize: 15 }} />,
      label: "Businesses",
    },
    {
      key: "/complaints",
      icon: <AlertOutlined style={{ fontSize: 15 }} />,
      label: "Complaints",
    },
    {
      key: "/audit-logs",
      icon: <HistoryOutlined style={{ fontSize: 15 }} />,
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
          <Text strong style={{ fontSize: 13 }}>{user?.full_name}</Text>
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
      {/* 220px Sidebar with subtle tinted active item */}
      <Sider
        width={220}
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#0f172a", // Deep slate
          borderRight: "1px solid #1e293b",
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 10,
            borderBottom: "1px solid #1e293b",
          }}
        >
          <SafetyCertificateFilled style={{ fontSize: 20, color: "#3b82f6" }} />
          <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
            ProcureX
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 4,
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            ADMIN
          </span>
        </div>

        {/* Sidebar Nav */}
        <div style={{ padding: "12px 8px" }}>
          {menuItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? "rgba(37, 99, 235, 0.16)" : "transparent",
                  color: isActive ? "#60a5fa" : "#94a3b8",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </Sider>

      {/* Main Layout Area */}
      <Layout style={{ background: "#f5f6f8" }}>
        {/* Top Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            height: 52,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>Portal /</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
              {menuItems.find((m) => m.key === currentPath)?.label || "Admin"}
            </span>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button
              type="text"
              size="small"
              style={{
                height: 32,
                padding: "2px 8px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
              }}
            >
              <Space align="center" size={6}>
                <Avatar
                  size={20}
                  style={{ backgroundColor: "#2563eb", fontSize: 11 }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  {user?.full_name || "Admin"}
                </span>
              </Space>
            </Button>
          </Dropdown>
        </Header>

        {/* Inner Content with 16-24px padding */}
        <Content
          style={{
            padding: "20px 24px",
            minHeight: "calc(100vh - 52px)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
