"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";
import { RootState } from "@/store";
import { darkTheme, lightTheme } from "@/constants";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = useSelector((state: RootState) => state.theme.mode);

  const themeConfig = mode === "dark" ? darkTheme : lightTheme;
  const algorithm =
    mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  useEffect(() => {
    // Set body background from token
    document.body.style.backgroundColor = themeConfig.token.colorBgBase;
    document.body.style.color = themeConfig.token.colorTextBase;
  }, [mode]);

  return (
    <ConfigProvider
      theme={{
        algorithm,
        ...themeConfig,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
