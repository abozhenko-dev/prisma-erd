import { FC, useCallback } from "react";

import { INodeTableData } from "@declarations";
import type { DMMF } from "@prisma/generator-helper";
import { isObject } from "lodash";
import { Handle, NodeProps, Position } from "reactflow";

import { Tooltip } from "@components/ui";

import { usePrisma } from "@hooks";

export const Table: FC<NodeProps<INodeTableData>> = ({ data }) => {
  const { enums } = usePrisma();

  const getEnum = useCallback(
    (name: string) => {
      const item = enums.find((item) => item.name === name);
      return item;
    },
    [enums]
  );

  const getColumnDefaultValue = (defaultValue: DMMF.FieldDefault | DMMF.FieldDefaultScalar | DMMF.FieldDefaultScalar[]) => {
    if (isObject(defaultValue) && "name" in defaultValue) {
      if (!defaultValue?.args?.length) return `${defaultValue.name}()`;
      else return `${defaultValue.name}("${defaultValue.args[0]}")`;
    } else {
      return JSON.stringify(defaultValue);
    }
  };

  return (
    <div className="table">
      <div className="table__name">{data.name}</div>

      <div className="table__columns">
        {data.columns.map((column, index: number) => {
          const enumeration = getEnum(column.type);
          const hasTooltip = enumeration || column.default !== undefined;

          return (
            <div key={index} className="table__column" style={{ backgroundColor: column.backgroundColor }}>
              {column.handleType && (
                <Handle
                  type={column.handleType}
                  position={Position.Left}
                  id={`${column.name}-left`}
                  className={column.handleType === "source" ? "left-handle source-handle" : "left-handle target-handle"}
                />
              )}

              {column.handleType && (
                <Handle
                  type={column.handleType}
                  position={Position.Right}
                  id={`${column.name}-right`}
                  className={column.handleType === "source" ? "right-handle source-handle" : "right-handle target-handle"}
                />
              )}

              <div className="table__column__inner">
                <div className="table__column__name">{column.name}</div>
                <div className="table__column__type" title={column.type}>
                  {column.type}

                  {column.isId ? <span style={{ marginLeft: ".5rem", color: "var(--clr-primary-200)" }}>pk</span> : <></>}
                  {column.isUnique ? <span style={{ marginLeft: ".5rem", color: "var(--clr-primary-200)" }}>unique</span> : <></>}
                  {!column.isRequired ? "?" : <></>}
                  {column.isList ? "[]" : <></>}
                </div>
              </div>

              {hasTooltip && (
                <Tooltip>
                  <Tooltip.Header>
                    <span>{column.name}</span>
                    <span className="yellow">{column.type}</span>
                  </Tooltip.Header>
                  <Tooltip.Body>
                    {enumeration && (
                      <>
                        <span className="red">VALUES</span>
                        <span className="green">
                          <pre>{enumeration.values.map((item) => item.name).join("\n")}</pre>
                        </span>
                      </>
                    )}

                    {column.default !== undefined && (
                      <>
                        <span className="red">DEFAULT</span>
                        <span className="green">
                          {!enumeration ? getColumnDefaultValue(column.default) : (column.default as string)}
                        </span>
                      </>
                    )}
                  </Tooltip.Body>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
