import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Alert,
  Card,
} from "antd";
import type { TableProps } from "antd";
import { ReloadOutlined, CodeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/admin";
import type { AuditLogRead } from "../types/api";

export const AuditLogsPage: React.FC = () => {
  const [selectedDetails, setSelectedDetails] = useState<Record<
    string,
    unknown
  > | null>(null);

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogs({ limit: 100 }),
  });

  const columns: TableProps<AuditLogRead>["columns"] = [
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {new Date(date).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: "Action Performed",
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 12,
            fontWeight: 600,
            color: action.includes("REJECTED")
              ? "#dc2626"
              : action.includes("VERIFIED")
              ? "#16a34a"
              : "#2563eb",
            backgroundColor: "#f3f4f6",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {action}
        </span>
      ),
    },
    {
      title: "Entity",
      dataIndex: "target_type",
      key: "target_type",
      render: (type: string) => (
        <span style={{ fontSize: 12, color: "#4b5563", textTransform: "uppercase" }}>
          {type}
        </span>
      ),
    },
    {
      title: "Target ID",
      dataIndex: "target_id",
      key: "target_id",
      render: (id: string) => (
        <code style={{ fontSize: 12, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
          {id.length > 12 ? `${id.substring(0, 10)}...` : id}
        </code>
      ),
    },
    {
      title: "Actor",
      dataIndex: "actor_id",
      key: "actor_id",
      render: (actor: string | null) =>
        actor ? (
          <code style={{ fontSize: 12, color: "#374151" }}>{actor.substring(0, 8)}</code>
        ) : (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>SYSTEM</span>
        ),
    },
    {
      title: "Payload",
      key: "details",
      align: "right",
      render: (_, record) =>
        record.details ? (
          <Button
            size="small"
            icon={<CodeOutlined />}
            onClick={() => setSelectedDetails(record.details)}
            style={{ fontSize: 12 }}
          >
            Inspect
          </Button>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
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
            Compliance & Audit Trail
          </h1>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Immutable administrative logs required by ProcureX verification audit standards
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
          message="Could not load audit logs"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          size="middle"
          pagination={{
            defaultPageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["15", "30", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} events`,
          }}
        />
      </Card>

      {/* JSON Payload Inspector Modal */}
      <Modal
        title="Audit Event Details"
        open={!!selectedDetails}
        onCancel={() => setSelectedDetails(null)}
        footer={[
          <Button key="close" size="small" onClick={() => setSelectedDetails(null)}>
            Close
          </Button>,
        ]}
      >
        <pre
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            padding: 12,
            borderRadius: 6,
            overflowX: "auto",
            maxHeight: 380,
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          {JSON.stringify(selectedDetails, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};
