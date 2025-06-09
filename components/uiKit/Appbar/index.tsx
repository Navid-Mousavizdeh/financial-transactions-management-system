"use client";

import { Layout, Typography, Switch, theme as antdTheme } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useMemo, useState, useEffect } from "react";
import { toggleTheme } from "@/store/slices/themeSlice";

const { Header } = Layout;

interface AppBarProps {
  title: string;
}

export const AppBar = ({ title }: AppBarProps) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const { token } = antdTheme.useToken();

  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    setAnimateKey((prev) => prev + 1);
  }, [themeMode]);

  const icon = useMemo(() => {
    const animatedStyle: React.CSSProperties = {
      fontSize: 20,
      color: token.colorPrimary,
      animation: "fadeScale 0.6s ease",
    };

    return themeMode === "dark" ? (
      <MoonOutlined style={animatedStyle} key={animateKey} />
    ) : (
      <SunOutlined style={animatedStyle} key={animateKey} />
    );
  }, [themeMode, token, animateKey]);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeScale {
          0% {
            transform: scale(0.1);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <Header
        style={{
          backgroundColor: token.colorBgContainer,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          paddingInline: "1.5rem",
          zIndex: 100,
          transition: "all 0.3s ease",
        }}
      >
        <Typography.Title
          level={5}
          style={{
            margin: 0,
            color: token.colorTextHeading,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography.Title>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {icon}
          <Switch
            checked={themeMode === "dark"}
            onChange={() => dispatch(toggleTheme())}
          />
        </div>
      </Header>
    </>
  );
};
