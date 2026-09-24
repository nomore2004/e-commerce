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
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
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
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Platform Overview
          </Title>
          <Text type="secondary">
            Live business verification pipeline and dispute metrics
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
          Refresh Stats
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : (
        <>
          {/* Top Row: Business Verification Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ borderLeft: "4px solid #1677ff" }}>
                <Statistic
                  title="Total Businesses"
                  value={stats?.businesses.total ?? 0}
                  prefix={<ShopOutlined style={{ color: "#1677ff" }} />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ borderLeft: "4px solid #faad14" }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate("/businesses?status=pending")}
                  >
                    View <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title="Pending Verification"
                  value={stats?.businesses.pending ?? 0}
                  valueStyle={{ color: "#faad14" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ borderLeft: "4px solid #52c41a" }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate("/businesses?status=verified")}
                  >
                    View <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title="Verified Suppliers"
                  value={stats?.businesses.verified ?? 0}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ borderLeft: "4px solid #ff4d4f" }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate("/businesses?status=rejected")}
                  >
                    View <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title="Rejected Businesses"
                  value={stats?.businesses.rejected ?? 0}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Bottom Row: Complaints & Quick Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                title="Active Disputes & Moderation"
                style={{ borderLeft: "4px solid #ff7a45" }}
                extra={
                  <Button
                    type="link"
                    onClick={() => navigate("/complaints?status=open")}
                  >
                    Review Queue <ArrowRightOutlined />
                  </Button>
                }
              >
                <Statistic
                  title="Open Complaints"
                  value={stats?.complaints.open ?? 0}
                  valueStyle={{ color: "#ff7a45" }}
                  prefix={<AlertOutlined />}
                />
                <Text type="secondary" style={{ marginTop: 12, display: "block" }}>
                  Complaints requiring admin intervention and supplier SLA review.
                </Text>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Quick Navigation">
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    block
                    icon={<ClockCircleOutlined />}
                    onClick={() => navigate("/businesses?status=pending")}
                  >
                    Review Pending Businesses ({stats?.businesses.pending ?? 0})
                  </Button>
                  <Button
                    block
                    icon={<AlertOutlined />}
                    onClick={() => navigate("/complaints")}
                  >
                    Manage Complaints
                  </Button>
                  <Button
                    block
                    onClick={() => navigate("/audit-logs")}
                  >
                    View System Audit Logs
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Space>
  );
};
