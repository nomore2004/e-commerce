import { Row, Col, Card, Table, Alert, Skeleton, Button } from "antd";
import type { TableProps } from "antd";
import {
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getBusinesses, getComplaints } from "../api/admin";
import type { BusinessRead, ComplaintRead } from "../types/api";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. Dashboard Stats
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  // 2. Pending Businesses (Real data: 6 pending businesses to fill vertical height cleanly)
  const {
    data: pendingBusinesses = [],
    isLoading: businessesLoading,
    refetch: refetchBusinesses,
  } = useQuery({
    queryKey: ["businesses", "pending"],
    queryFn: () => getBusinesses({ status: "pending", limit: 6 }),
  });

  // 3. Open Complaints (Real data: 6 open complaints)
  const {
    data: openComplaints = [],
    isLoading: complaintsLoading,
    refetch: refetchComplaints,
  } = useQuery({
    queryKey: ["complaints", "open"],
    queryFn: () => getComplaints({ status: "open", limit: 6 }),
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchBusinesses();
    refetchComplaints();
  };

  if (statsError) {
    return (
      <Alert
        type="error"
        message="Failed to load dashboard statistics"
        description={statsErrorObj instanceof Error ? statsErrorObj.message : "Service unavailable"}
        action={
          <Button size="small" type="primary" onClick={handleRefreshAll}>
            Retry
          </Button>
        }
        showIcon
      />
    );
  }

  // Pending table columns with compact 8px padding
  const pendingColumns: TableProps<BusinessRead>["columns"] = [
    {
      title: "Business",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>{name}</span>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            ID: {record.id.substring(0, 8)}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "business_type",
      key: "business_type",
      render: (type: string) => <span style={{ color: "#475569" }}>{type}</span>,
    },
    {
      title: "GSTIN",
      dataIndex: "gst_no",
      key: "gst_no",
      render: (gst: string) => (
        <code style={{ fontSize: 11, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "1px 5px", borderRadius: 4 }}>
          {gst}
        </code>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span style={{ color: "#64748b", fontSize: 12 }}>
          {new Date(date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          onClick={() => navigate(`/businesses/${record.id}`)}
          style={{ fontSize: 12, height: 28 }}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 2px 0", color: "#0f172a", letterSpacing: "-0.02em" }}>
            Overview
          </h1>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Procurement verification pipeline and dispute monitoring
          </span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={handleRefreshAll}
          loading={statsLoading || businessesLoading || complaintsLoading}
          style={{ height: 30 }}
        >
          Refresh
        </Button>
      </div>

      {statsLoading ? (
        <Card style={{ marginBottom: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      ) : (
        <>
          {/* Four equal-height cards: 16px padding, 1px #e2e8f0 border, white background */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {/* Card 1: Total Businesses */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                onClick={() => navigate("/businesses")}
                style={{ height: "100%", cursor: "pointer", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em" }}>
                    TOTAL BUSINESSES
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#94a3b8" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                  {stats?.businesses.total ?? 0}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Registered vendor & buyer profiles
                </div>
              </Card>
            </Col>

            {/* Card 2: Pending Verification */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                onClick={() => navigate("/businesses?status=pending")}
                style={{ height: "100%", cursor: "pointer", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em" }}>
                    PENDING VERIFICATION
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                  {stats?.businesses.pending ?? 0}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Awaiting GST & address review
                </div>
              </Card>
            </Col>

            {/* Card 3: Verified Suppliers */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                onClick={() => navigate("/businesses?status=verified")}
                style={{ height: "100%", cursor: "pointer", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em" }}>
                    VERIFIED SUPPLIERS
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                  {stats?.businesses.verified ?? 0}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Active authorized procurement vendors
                </div>
              </Card>
            </Col>

            {/* Card 4: Rejected Profiles */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                onClick={() => navigate("/businesses?status=rejected")}
                style={{ height: "100%", cursor: "pointer", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em" }}>
                    REJECTED BUSINESSES
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                  {stats?.businesses.rejected ?? 0}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Failed compliance or TIN validation
                </div>
              </Card>
            </Col>
          </Row>

          {/* Real data: Pending verification table + Open complaints list */}
          <Row gutter={[16, 16]}>
            {/* Left: Pending Verification Table */}
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Pending Verification</span>
                      <span style={{ fontSize: 11, backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {stats?.businesses.pending ?? 0}
                      </span>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate("/businesses?status=pending")}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all <ArrowRightOutlined />
                    </Button>
                  </div>
                }
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={pendingBusinesses}
                  columns={pendingColumns}
                  rowKey="id"
                  loading={businessesLoading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "No businesses pending verification." }}
                />
              </Card>
            </Col>

            {/* Right: Open Complaints List (Real data items) */}
            <Col xs={24} lg={9}>
              <Card
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Open Complaints</span>
                      <span style={{ fontSize: 11, backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {stats?.complaints.open ?? 0}
                      </span>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate("/complaints?status=open")}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all <ArrowRightOutlined />
                    </Button>
                  </div>
                }
                styles={{ body: { padding: 0 } }}
              >
                {complaintsLoading ? (
                  <div style={{ padding: 16 }}>
                    <Skeleton active paragraph={{ rows: 4 }} />
                  </div>
                ) : openComplaints.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    No open disputes currently recorded.
                  </div>
                ) : (
                  <div>
                    {openComplaints.map((c: ComplaintRead) => (
                      <div
                        key={c.id}
                        style={{
                          padding: "10px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 10,
                          backgroundColor: "#ffffff",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>
                            {c.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.description}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                            Filed {new Date(c.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · Target {c.business_id.substring(0, 8)}
                          </div>
                        </div>
                        <Button
                          type="default"
                          size="small"
                          onClick={() => navigate("/complaints")}
                          style={{ fontSize: 11, height: 26, flexShrink: 0 }}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
