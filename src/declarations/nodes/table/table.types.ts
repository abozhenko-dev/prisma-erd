import { DMMF } from "@prisma/generator-helper";

export interface INodeTableColumn extends DMMF.Field {
  backgroundColor?: string;
}

/* ---------------------------------------------------------------------------------------------- */

export interface INodeTableData {
  name: string;
  dbName: string | null;
  columns: INodeTableColumn[];
}
