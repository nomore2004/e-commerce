import React, { useState } from "react";
import {
  Table,
  Select,
  Card,
  Alert,
  Modal,
  Form,
  Input,
  message,
  Button,
} from "antd";
import type { TableProps } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaints, updateComplaintStatus } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { ComplaintRead, ComplaintStatus } from "../types/api";

const { TextArea } = Input;

export const ComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | undefined>(
    undefined
  );

  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintRead | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ComplaintStatus | null>(
    null
  );
  const [resolutionForm] = Form.useForm();

  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["complaints", statusFilter],
    queryFn: () => getComplaints({ status: statusFilter, limit: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolution_notes,
    }: {
      id: string;
      status: ComplaintStatus;
      resolution_notes?: string;
    }) => updateComplaintStatus(id, { status, resolution_notes }),
    onSuccess: (updated) => {
      message.success(
        `Complaint updated to ${updated.status.toUpperCase()} successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setResolutionModalOpen(false);
      setSelectedComplaint(null);
      setPendingStatus(null);
      resolutionForm.resetFields();
    },
    onError: (err: unknown) => {
      message.error(
        err instanceof Error
          ? err.message
          : "Failed to update complaint status"
      );
    },
  });

  const handleStatusSelect = (
    complaint: ComplaintRead,
    newStatus: ComplaintStatus
  ) => {
    if (newStatus === "resolved" || newStatus === "dismissed") {
      setSelectedComplaint(complaint);
      setPendingStatus(newStatus);
      resolutionForm.setFieldsValue({
        resolution_notes: complaint.resolution_notes || "",
      });
      setResolutionModalOpen(true);
    } else {
      statusMutation.mutate({
        id: complaint.id,
        status: newStatus,
      });
    }
  };

  const handleModalSubmit = (values: { resolution_notes: string }) => {
    if (!selectedComplaint || !pendingStatus) return;
    statusMutation.mutate({
      id: selectedComplaint.id,
      status: pendingStatus,
      resolution_notes: values.resolution_notes,
    });
  };

  const columns: TableProps<ComplaintRead>["columns"] = [
    {
      title: "Complaint",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontWeight: 600, color: "#111827" }}>{title}</div>
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Target Business",
      dataIndex: "business_id",
      key: "business_id",
      render: (bizId: string) => (
        <code style={{ fontSize: 12, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
          {bizId.substring(0, 8)}
        </code>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ComplaintStatus) => <StatusTag status={status} />,
    },
    {
      title: "Resolution Notes",
      dataIndex: "resolution_notes",
      key: "resolution_notes",
      render: (notes: string | null) =>
        notes ? (
          <span style={{ color: "#4b5563", fontSize: 12, fontStyle: "italic" }}>
            "{notes}"
          </span>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Filed At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span style={{ color: "#6b7280", fontSize: 12 }}>
          {new Date(date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Update",
      key: "update_status",
      align: "right",
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(newVal) => handleStatusSelect(record, newVal)}
          style={{ width: 140 }}
          size="small"
          options={[
            { label: "Open", value: "open" },
            { label: "Under Review", value: "under_review" },
            { label: "Resolved", value: "resolved" },
            { label: "Dismissed", value: "dismissed" },
          ]}
        />
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
            Dispute & Complaints Moderation
          </h1>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Active buyer and vendor grievances, damaged inventory, and contract claims
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
          message="Could not load complaints"
          description={error instanceof Error ? error.message : "Error"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          allowClear
          size="small"
          style={{ width: 180 }}
          options={[
            { label: "All Complaints", value: undefined },
            { label: "Open", value: "open" },
            { label: "Under Review", value: "under_review" },
            { label: "Resolved", value: "resolved" },
            { label: "Dismissed", value: "dismissed" },
          ]}
        />
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={complaints}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          size="middle"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} complaints`,
          }}
        />
      </Card>

      {/* Resolution Notes Modal */}
      <Modal
        title={`Add Resolution Notes (${pendingStatus?.toUpperCase()})`}
        open={resolutionModalOpen}
        onCancel={() => {
          setResolutionModalOpen(false);
          setSelectedComplaint(null);
          setPendingStatus(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={resolutionForm}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="resolution_notes"
            label="Resolution / Closing Notes"
            rules={[
              {
                required: true,
                message: "Please provide resolution notes before closing.",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., Replacement parts dispatched under warranty tracking #9821."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              size="small"
              onClick={() => {
                setResolutionModalOpen(false);
                setSelectedComplaint(null);
                setPendingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="small"
              htmlType="submit"
              loading={statusMutation.isPending}
            >
              Save & Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
