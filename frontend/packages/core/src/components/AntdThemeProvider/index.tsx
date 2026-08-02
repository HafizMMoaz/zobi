import { ConfigProvider, type ConfigProviderProps } from 'antd';

export const AntdThemeProvider = ({
  children,
  ...rest
}: ConfigProviderProps) => (
  <ConfigProvider {...rest}>{children}</ConfigProvider>
);
