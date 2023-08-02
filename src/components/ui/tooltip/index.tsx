import { ReactNode } from "react";

import { Body } from "./body";
import { Header } from "./header";

export interface TooltipProps {
  className?: string;
  children: ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => (
  <div className="tooltip">
    <div className="tooltip__inner">{children}</div>
  </div>
);

Tooltip.Header = Header;
Tooltip.Body = Body;

export { Tooltip };
