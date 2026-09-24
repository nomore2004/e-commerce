import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Card,
  Alert,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBusinesses } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { BusinessRead, BusinessStatus } from "../types/api";

export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const statusParam = searchParams.get("status") as BusinessStatus | null;
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | undefined>(
    statusParam || undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");

  const {
    data: businesses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["businesses", statusFilter],
    queryFn: () => getBusinesses({ status: statusFilter, limit: 100 }),
  });

  // Client-side filtering
  const filteredData = businesses.filter((b) => {
    const matchesSearch =
      searchText.trim() === "" ||
      b.name.toLowerCase().includes(searchText.toLowerCase()) ||
      b.gst_no.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = !typeFilter || b.business_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const businessTypes = Array.from(
    new Set(businesses.map((b) => b.business_type))
  );

  const handleStatusChange = (val: BusinessStatus | undefined) => {
    setStatusFilter(val);
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const columns: TableProps<BusinessRead>["columns"] = [
    {
      title: "Business Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <span style={{ fontWeight: 600, color: "#111827" }}>{name}</span>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            ID: {record.id.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      title: "Classification",
      dataIndex: "business_type",
      key: "business_type",
      render: (type: string) => <span style={{ color: "#4b5563" }}>{type}</span>,
    },
    {
      title: "GSTIN",
      dataIndex: "gst_no",
      key: "gst_no",
      render: (gst: string) => (
        <code style={{ fontSize: 12, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
          {gst}
        </code>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BusinessStatus) => <StatusTag status={status} />,
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span style={{ color: "#6b7280", fontSize: 12 }}>
          {new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
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
          style={{ fontSize: 12 }}
        >
          Review Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 2px 0", color: "#111827", letterSpacing: "-0.02em" }}>
            Registered Businesses
          </h1>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Manage supplier onboarding, GST verification, and compliance statuses
          </span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Could not load businesses"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <Space wrap size="small">
          <Input
            placeholder="Search business name or GST..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            size="small"
            allowClear
          />

          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={handleStatusChange}
            allowClear
            size="small"
            style={{ width: 150 }}
            options={[
              { label: "All Statuses", value: undefined },
              { label: "Pending", value: "pending" },
              { label: "Verified", value: "verified" },
              { label: "Rejected", value: "rejected" },
            ]}
          />

          <Select
            placeholder="Type"
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            allowClear
            size="small"
            style={{ width: 160 }}
            options={[
              { label: "All Types", value: undefined },
              ...businessTypes.map((t) => ({ label: t, value: t })),
            ]}
          />

          {(searchText || statusFilter || typeFilter) && (
            <Button
              size="small"
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText("");
                handleStatusChange(undefined);
                setTypeFilter(undefined);
              }}
            >
              Reset
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          size="middle"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} businesses`,
          }}
        />
      </Card>
    </div>
  );
};
