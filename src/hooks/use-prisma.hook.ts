import { useContext } from "react";

import { PrismaContext } from "@contexts";

export const usePrisma = () => useContext(PrismaContext);
