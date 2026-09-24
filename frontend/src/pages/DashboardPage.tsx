import React from "react";
import { Row, Col, Card, Statistic, Typography, Alert, Skeleton, Button, Space } from "antd";
import {
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlertOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../api/admin";

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  if (isError) {
    return (
      <Alert
        type="error"
        message="Failed to load dashboard statistics"
        description={error instanceof Error ? error.message : "Backend service may be unavailable."}
        action={
          <Button size="small" type="primary" danger onClick={() => refetch()}>
            Retry
          </Button>
        }
        showIcon
      />
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={2} style={{ margin: "0 0 4px 0", fontWeight: 700, color: "#111827" }}>
            Dashboard Overview
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Real-time procurement pipeline, business verification queues, and dispute alerts
          </Text>
        </div>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh Data
        </Button>
      </div>

      {isLoading ? (
        <Card style={{ borderRadius: 8 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : (
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Top Row: Metric Stat Cards */}
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} xl={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 10,
                  borderTop: "4px solid #1677ff",
                  height: "100%",
                }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600, color: "#6b7280" }}>TOTAL BUSINESSES</span>}
                  value={stats?.businesses.total ?? 0}
                  valueStyle={{ fontWeight: 700, color: "#1f2937", fontSize: 32 }}
                  prefix={<ShopOutlined style={{ color: "#1677ff", marginRight: 8 }} />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                  Registered vendor & buyer profiles
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 10,
                  borderTop: "4px solid #faad14",
                  height: "100%",
                }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => navigate("/businesses?status=pending")}
                  >
                    Review <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title={<span style={{ fontWeight: 600, color: "#d97706" }}>PENDING VERIFICATION</span>}
                  value={stats?.businesses.pending ?? 0}
                  valueStyle={{ fontWeight: 700, color: "#d97706", fontSize: 32 }}
                  prefix={<ClockCircleOutlined style={{ marginRight: 8 }} />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                  Awaiting GST & address review
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 10,
                  borderTop: "4px solid #52c41a",
                  height: "100%",
                }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => navigate("/businesses?status=verified")}
                  >
                    View <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title={<span style={{ fontWeight: 600, color: "#15803d" }}>VERIFIED SUPPLIERS</span>}
                  value={stats?.businesses.verified ?? 0}
                  valueStyle={{ fontWeight: 700, color: "#15803d", fontSize: 32 }}
                  prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                  Cleared for POs and contracts
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 10,
                  borderTop: "4px solid #ff4d4f",
                  height: "100%",
                }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => navigate("/businesses?status=rejected")}
                  >
                    View <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title={<span style={{ fontWeight: 600, color: "#b91c1c" }}>REJECTED BUSINESSES</span>}
                  value={stats?.businesses.rejected ?? 0}
                  valueStyle={{ fontWeight: 700, color: "#b91c1c", fontSize: 32 }}
                  prefix={<CloseCircleOutlined style={{ marginRight: 8 }} />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                  Non-compliant or invalid TIN/GST
                </div>
              </Card>
            </Col>
          </Row>

          {/* Lower Row: Complaints Queue & Quick Actions */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <Space>
                    <AlertOutlined style={{ color: "#ea580c" }} />
                    <span style={{ fontWeight: 600 }}>Active Dispute Pipeline</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    onClick={() => navigate("/complaints?status=open")}
                  >
                    Manage Queue <ArrowRightOutlined />
                  </Button>
                }
                style={{ borderRadius: 10, height: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "#fff7ed",
                    borderRadius: 8,
                    border: "1px solid #ffedd5",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#9a3412" }}>
                      Open Unresolved Complaints
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Urgent buyer order SLA discrepancies, damaged goods, or invoice mismatches
                    </Text>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#ea580c", paddingLeft: 16 }}>
                    {stats?.complaints.open ?? 0}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                title={
                  <Space>
                    <FileProtectOutlined style={{ color: "#1677ff" }} />
                    <span style={{ fontWeight: 600 }}>Administrative Quick Actions</span>
                  </Space>
                }
                style={{ borderRadius: 10, height: "100%" }}
              >
                <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={() => navigate("/businesses?status=pending")}
                  >
                    Review Pending Businesses ({stats?.businesses.pending ?? 0})
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<AlertOutlined />}
                    onClick={() => navigate("/complaints")}
                  >
                    Moderate Complaints Queue
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<FileProtectOutlined />}
                    onClick={() => navigate("/audit-logs")}
                  >
                    View System Audit Trail
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      )}
    </div>
  );
};
