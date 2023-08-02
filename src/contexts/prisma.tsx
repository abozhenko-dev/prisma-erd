import { FC, ReactNode, createContext } from "react";

import { BASE_URL } from "@constants";
import { DMMF } from "@prisma/generator-helper";
import useSWR from "swr";

export interface PrismaContextProps {
  enums: DMMF.DatamodelEnum[];
  models: DMMF.Model[];
}

export interface PrismaProviderProps {
  children: ReactNode;
}

const PrismaContext = createContext({} as PrismaContextProps);

const PrismaProvider: FC<PrismaProviderProps> = ({ children }) => {
  const { data: database } = useSWR<DMMF.Document>(BASE_URL.database, { refreshInterval: 1000 });

  return (
    <PrismaContext.Provider
      value={{
        models: database?.datamodel?.models || [],
        enums: database?.datamodel?.enums || []
      }}
    >
      {children}
    </PrismaContext.Provider>
  );
};

export { PrismaProvider, PrismaContext };
