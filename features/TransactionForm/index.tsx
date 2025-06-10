"use client";

import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Divider,
  Typography,
  Space,
  Spin,
} from "antd";
import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "@/schemas";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useTransaction } from "./hooks/useTransaction";
import { useCreateTransaction } from "./hooks/useCreateTransaction";
import { useUpdateTransaction } from "./hooks/useUpdateTransaction";
import { useDeleteTransaction } from "./hooks/useDeleteTransaction";

dayjs.extend(customParseFormat);

const { Title } = Typography;
const { Option } = Select;

type Transaction = z.infer<typeof TransactionSchema>;

interface TransactionFormProps {
  id?: string;
}

export default function TransactionForm({ id }: TransactionFormProps) {
  const router = useRouter();
  const isUpdateMode = !!id;

  // Fetch transaction data for UPDATE/DELETE mode
  const {
    data: transaction,
    isLoading: isFetching,
    error,
  } = useTransaction(id || "");
  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransaction(id || "");
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction(id || "");

  // Initialize form with default values
  const methods = useForm<Transaction>({
    resolver: zodResolver(TransactionSchema),
    mode: "onChange", // Validate on every input change
    reValidateMode: "onChange", // Revalidate on change
    defaultValues: isUpdateMode
      ? {
          id: "",
          amount: 0,
          currency: "",
          status: "pending",
          timestamp: "",
          description: "",
          merchant: { name: "", id: "" },
          payment_method: { type: "", last4: "", brand: "" },
          sender: { name: "", account_id: "" },
          receiver: { name: "", account_id: "" },
          fees: { processing_fee: 0, currency: "" },
          metadata: { order_id: "", customer_id: "" },
        }
      : {
          id: crypto.randomUUID(),
          status: "pending",
          timestamp: new Date().toISOString(),
          currency: "USD",
          fees: { processing_fee: 0, currency: "USD" },
          merchant: { name: "", id: "" },
          payment_method: { type: "", last4: "", brand: "" },
          sender: { name: "", account_id: "" },
          receiver: { name: "", account_id: "" },
          metadata: { order_id: "", customer_id: "" },
        },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;

  // Populate form with fetched data in UPDATE/DELETE mode
  React.useEffect(() => {
    if (transaction && isUpdateMode) {
      reset({
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        timestamp: transaction.timestamp,
        description: transaction.description || "",
        merchant: {
          name: transaction.merchant?.name || "",
          id: transaction.merchant?.id || "",
        },
        payment_method: {
          type: transaction.payment_method?.type || "",
          last4: transaction.payment_method?.last4 || "",
          brand: transaction.payment_method?.brand || "",
        },
        sender: {
          name: transaction.sender?.name || "",
          account_id: transaction.sender?.account_id || "",
        },
        receiver: {
          name: transaction.receiver?.name || "",
          account_id: transaction.receiver?.account_id || "",
        },
        fees: {
          processing_fee: transaction.fees?.processing_fee || 0,
          currency: transaction.fees?.currency || "",
        },
        metadata: {
          order_id: transaction.metadata?.order_id || "",
          customer_id: transaction.metadata?.customer_id || "",
        },
      });
    }
  }, [transaction, isUpdateMode, reset]);

  const onSubmit = (data: Transaction) => {
    if (isUpdateMode) {
      updateTransaction(data);
    } else {
      createTransaction(data);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteTransaction();
    }
  };

  const renderError = (field?: any) =>
    field && <span style={{ color: "red" }}>{field.message}</span>;

  if (isUpdateMode && isFetching) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <Spin size="large" />
        <p>Loading transaction data...</p>
      </div>
    );
  }

  if (isUpdateMode && error) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <p style={{ color: "red" }}>Error: {error.message}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Space align="baseline" size="middle" style={{ marginBottom: 32 }}>
        <ArrowLeftOutlined
          style={{ padding: 4 }}
          onClick={() => router.back()}
        />
        <Title style={{ marginBottom: 0 }} level={3}>
          {isUpdateMode ? "Edit Transaction" : "Create Transaction"}
        </Title>
      </Space>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        disabled={isCreating || isUpdating || isDeleting}
      >
        <Form.Item label="Transaction ID">
          <Controller
            name="id"
            control={control}
            render={({ field }) => <Input {...field} disabled={isUpdateMode} />}
          />
          {renderError(errors.id)}
        </Form.Item>

        <Form.Item label="Amount">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: "100%" }} />
            )}
          />
          {renderError(errors.amount)}
        </Form.Item>

        <Form.Item label="Currency">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => <Input {...field} maxLength={3} />}
          />
          {renderError(errors.currency)}
        </Form.Item>

        <Form.Item label="Status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} style={{ width: "100%" }}>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
              </Select>
            )}
          />
          {renderError(errors.status)}
        </Form.Item>

        <Form.Item label="Timestamp">
          <Controller
            name="timestamp"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                style={{ width: "100%" }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(value) => field.onChange(value?.toISOString() || "")}
              />
            )}
          />
          {renderError(errors.timestamp)}
        </Form.Item>

        <Form.Item label="Description">
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.description)}
        </Form.Item>

        <Divider orientation="left">Merchant</Divider>
        <Form.Item label="Merchant Name">
          <Controller
            name="merchant.name"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.merchant?.name)}
        </Form.Item>
        <Form.Item label="Merchant ID">
          <Controller
            name="merchant.id"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.merchant?.id)}
        </Form.Item>

        <Divider orientation="left">Payment Method</Divider>
        <Form.Item label="Type">
          <Controller
            name="payment_method.type"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.payment_method?.type)}
        </Form.Item>
        <Form.Item label="Last 4 Digits">
          <Controller
            name="payment_method.last4"
            control={control}
            render={({ field }) => <Input {...field} maxLength={4} />}
          />
          {renderError(errors.payment_method?.last4)}
        </Form.Item>
        <Form.Item label="Brand">
          <Controller
            name="payment_method.brand"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.payment_method?.brand)}
        </Form.Item>

        <Divider orientation="left">Sender</Divider>
        <Form.Item label="Sender Name">
          <Controller
            name="sender.name"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.sender?.name)}
        </Form.Item>
        <Form.Item label="Sender Account ID">
          <Controller
            name="sender.account_id"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.sender?.account_id)}
        </Form.Item>

        <Divider orientation="left">Receiver</Divider>
        <Form.Item label="Receiver Name">
          <Controller
            name="receiver.name"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.receiver?.name)}
        </Form.Item>
        <Form.Item label="Receiver Account ID">
          <Controller
            name="receiver.account_id"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.receiver?.account_id)}
        </Form.Item>

        <Divider orientation="left">Fees</Divider>
        <Form.Item label="Processing Fee">
          <Controller
            name="fees.processing_fee"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: "100%" }} />
            )}
          />
          {renderError(errors.fees?.processing_fee)}
        </Form.Item>
        <Form.Item label="Fee Currency">
          <Controller
            name="fees.currency"
            control={control}
            render={({ field }) => <Input {...field} maxLength={3} />}
          />
          {renderError(errors.fees?.currency)}
        </Form.Item>

        <Divider orientation="left">Metadata</Divider>
        <Form.Item label="Order ID">
          <Controller
            name="metadata.order_id"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.metadata?.order_id)}
        </Form.Item>
        <Form.Item label="Customer ID">
          <Controller
            name="metadata.customer_id"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {renderError(errors.metadata?.customer_id)}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
            >
              {isUpdateMode ? "Update Transaction" : "Create Transaction"}
            </Button>
            {isUpdateMode && (
              <Button
                type="primary"
                danger
                onClick={handleDelete}
                loading={isDeleting}
                icon={<DeleteOutlined />}
              >
                Delete Transaction
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
