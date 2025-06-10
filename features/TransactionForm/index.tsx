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
} from "antd";
import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "@/schemas";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

dayjs.extend(customParseFormat);

const { Title } = Typography;
const { Option } = Select;

type Transaction = z.infer<typeof TransactionSchema>;

export default function TransactionForm() {
  const router = useRouter();

  const methods = useForm<Transaction>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      status: "pending",
      timestamp: new Date(),
    } as any,
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = (data: Transaction) => {
    console.log("Submitted data", data);
  };

  const renderError = (field?: any) =>
    field && <span style={{ color: "red" }}>{field.message}</span>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Space align="baseline" size={"middle"} style={{ marginBottom: 32 }}>
        <ArrowLeftOutlined
          style={{ padding: 4 }}
          onClick={() => {
            router.back();
          }}
        />
        <Title style={{ marginBottom: 0 }} level={3}>
          Create Transaction
        </Title>
      </Space>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Transaction ID">
          {renderError(errors.id)}
          <Input {...register("id")} />
        </Form.Item>

        <Form.Item label="Amount">
          {renderError(errors.amount)}
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: "100%" }} />
            )}
          />
        </Form.Item>

        <Form.Item label="Currency">
          {renderError(errors.currency)}
          <Input {...register("currency")} />
        </Form.Item>

        <Form.Item label="Status">
          {renderError(errors.status)}
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field}>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Timestamp">
          {renderError(errors.timestamp)}
          <Controller
            name="timestamp"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                style={{ width: "100%" }}
                value={dayjs(field.value)}
                onChange={(value) => field.onChange(value?.toDate())}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Description">
          {renderError(errors.description)}
          <Input {...register("description")} />
        </Form.Item>

        <Divider orientation="left">Merchant</Divider>
        <Form.Item label="Merchant Name">
          {renderError(errors?.merchant?.name)}
          <Input {...register("merchant.name")} />
        </Form.Item>
        <Form.Item label="Merchant ID">
          {renderError(errors?.merchant?.id)}
          <Input {...register("merchant.id")} />
        </Form.Item>

        <Divider orientation="left">Payment Method</Divider>
        <Form.Item label="Type">
          {renderError(errors?.payment_method?.type)}
          <Input {...register("payment_method.type")} />
        </Form.Item>
        <Form.Item label="Last 4 Digits">
          {renderError(errors?.payment_method?.last4)}
          <Input {...register("payment_method.last4")} />
        </Form.Item>
        <Form.Item label="Brand">
          {renderError(errors?.payment_method?.brand)}
          <Input {...register("payment_method.brand")} />
        </Form.Item>

        <Divider orientation="left">Sender</Divider>
        <Form.Item label="Sender Name">
          {renderError(errors?.sender?.name)}
          <Input {...register("sender.name")} />
        </Form.Item>
        <Form.Item label="Sender Account ID">
          {renderError(errors?.sender?.account_id)}
          <Input {...register("sender.account_id")} />
        </Form.Item>

        <Divider orientation="left">Receiver</Divider>
        <Form.Item label="Receiver Name">
          {renderError(errors?.receiver?.name)}
          <Input {...register("receiver.name")} />
        </Form.Item>
        <Form.Item label="Receiver Account ID">
          {renderError(errors?.receiver?.account_id)}
          <Input {...register("receiver.account_id")} />
        </Form.Item>

        <Divider orientation="left">Fees</Divider>
        <Form.Item label="Processing Fee">
          {renderError(errors?.fees?.processing_fee)}
          <Controller
            name="fees.processing_fee"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: "100%" }} />
            )}
          />
        </Form.Item>
        <Form.Item label="Fee Currency">
          {renderError(errors?.fees?.currency)}
          <Input {...register("fees.currency")} />
        </Form.Item>

        <Divider orientation="left">Metadata</Divider>
        <Form.Item label="Order ID">
          {renderError(errors?.metadata?.order_id)}
          <Input {...register("metadata.order_id")} />
        </Form.Item>
        <Form.Item label="Customer ID">
          {renderError(errors?.metadata?.customer_id)}
          <Input {...register("metadata.customer_id")} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Create Transaction
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
