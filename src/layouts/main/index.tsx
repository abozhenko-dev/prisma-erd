import { FC, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <div className="wrapper">
    <main>{children}</main>
  </div>
);
