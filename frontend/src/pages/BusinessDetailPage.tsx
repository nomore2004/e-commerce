import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Alert,
  Skeleton,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getBusinessById, verifyBusiness } from "../api/admin";
import { StatusTag } from "../components/StatusTag";
import type { BusinessVerifyRequest } from "../types/api";

const { TextArea } = Input;

export const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  const {
    data: business,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id!),
    enabled: !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: (payload: BusinessVerifyRequest) => verifyBusiness(id!, payload),
    onSuccess: (updated) => {
      message.success(
        `Business marked as ${updated.status.toUpperCase()} successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setRejectModalOpen(false);
      rejectForm.resetFields();
    },
    onError: (err: unknown) => {
      message.error(
        err instanceof Error
          ? err.message
          : "Failed to update business verification status"
      );
    },
  });

  const handleApprove = () => {
    Modal.confirm({
      title: "Approve Business Verification?",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to approve "${business?.name}"? This supplier will be flagged as VERIFIED and permitted to transact.`,
      okText: "Yes, Approve",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => {
        verifyMutation.mutate({ status: "verified" });
      },
    });
  };

  const handleRejectSubmit = (values: { rejection_reason: string }) => {
    verifyMutation.mutate({
      status: "rejected",
      rejection_reason: values.rejection_reason,
    });
  };

  if (isError) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button icon={<ArrowLeftOutlined />} size="small" onClick={() => navigate("/businesses")}>
          Back
        </Button>
        <Alert
          type="error"
          message="Business not found"
          description={error instanceof Error ? error.message : "Failed to load"}
          showIcon
        />
      </Space>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            size="small"
            onClick={() => navigate("/businesses")}
          >
            Back
          </Button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "#111827", letterSpacing: "-0.02em" }}>
                {business ? business.name : "Business Profile"}
              </h1>
              {business && <StatusTag status={business.status} />}
            </div>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Supplier verification & compliance dossier
            </span>
          </div>
        </Space>

        {business && (
          <Space>
            {business.status !== "verified" && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={verifyMutation.isPending}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Approve Supplier
              </Button>
            )}

            {business.status !== "rejected" && (
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModalOpen(true)}
                loading={verifyMutation.isPending}
              >
                Reject Supplier
              </Button>
            )}
          </Space>
        )}
      </div>

      {isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : business ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {/* Rejection Alert if Rejected */}
          {business.status === "rejected" && (
            <Alert
              type="error"
              message="Verification Rejected"
              description={
                business.rejection_reason ||
                "No detailed reason provided for this rejection."
              }
              showIcon
            />
          )}

          <Card
            title="Entity Dossier"
            styles={{ body: { padding: 0 } }}
          >
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Legal Entity Name" span={2}>
                <span style={{ fontWeight: 600 }}>{business.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Verification Status">
                <StatusTag status={business.status} />
              </Descriptions.Item>

              <Descriptions.Item label="Business Classification">
                {business.business_type}
              </Descriptions.Item>
              <Descriptions.Item label="GST Identification (GSTIN)">
                <code style={{ fontSize: 12, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                  {business.gst_no}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Submission Date">
                {new Date(business.created_at).toLocaleString("en-IN")}
              </Descriptions.Item>

              <Descriptions.Item label="Registered Address" span={3}>
                <div style={{ color: "#374151" }}>{business.address}</div>
              </Descriptions.Item>

              <Descriptions.Item label="Verified By (Admin UUID)">
                {business.verified_by ? (
                  <code style={{ fontSize: 12 }}>{business.verified_by}</code>
                ) : (
                  <span style={{ color: "#9ca3af" }}>Pending</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Verified Date">
                {business.verified_at
                  ? new Date(business.verified_at).toLocaleString("en-IN")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Update">
                {new Date(business.updated_at).toLocaleString("en-IN")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ) : null}

      {/* Reject Modal */}
      <Modal
        title="Reject Business Verification"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          initialValues={{ rejection_reason: "" }}
        >
          <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 12 }}>
            Specify mandatory reason for rejecting <strong>{business?.name}</strong>:
          </div>

          <Form.Item
            name="rejection_reason"
            label="Rejection Reason"
            rules={[
              { required: true, message: "Please provide a rejection reason" },
              { min: 10, message: "Minimum 10 characters required" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., GST registration certificate blurred or invalid TIN mismatch."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button size="small" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              size="small"
              htmlType="submit"
              loading={verifyMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
