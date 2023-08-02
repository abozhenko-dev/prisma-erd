import { FC, ReactNode } from "react";

interface BodyProps {
  children: ReactNode;
}

export const Body: FC<BodyProps> = ({ children }) => <div className="tooltip__body">{children}</div>;
