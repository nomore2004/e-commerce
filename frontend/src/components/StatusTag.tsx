import React from "react";
import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { BusinessStatus, ComplaintStatus } from "../types/api";

interface StatusTagProps {
  status: BusinessStatus | ComplaintStatus | string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  switch (status) {
    // Business statuses
    case "pending":
      return (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          PENDING
        </Tag>
      );
    case "verified":
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          VERIFIED
        </Tag>
      );
    case "rejected":
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          REJECTED
        </Tag>
      );

    // Complaint statuses
    case "open":
      return (
        <Tag icon={<ClockCircleOutlined />} color="error">
          OPEN
        </Tag>
      );
    case "under_review":
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          UNDER REVIEW
        </Tag>
      );
    case "resolved":
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          RESOLVED
        </Tag>
      );
    case "dismissed":
      return (
        <Tag icon={<StopOutlined />} color="default">
          DISMISSED
        </Tag>
      );

    default:
      return <Tag>{status.toUpperCase()}</Tag>;
  }
};
