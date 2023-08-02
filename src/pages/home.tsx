import { useEffect, useState } from "react";

import { INodeTableData } from "@declarations";
import { Edge, Node, ReactFlowProvider } from "reactflow";

import { Flow } from "@components/common";

import { usePrisma } from "@hooks";

import { ApiService } from "@services";

export const Home = () => {
  const { models } = usePrisma();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const generate = async () => {
      if (!models?.length) return [];

      const nodes: Node<INodeTableData>[] = [];
      const edges: Edge[] = [];
      const relations: {
        types: Record<string, "hasOne" | "hasMany">;
        tables: Record<
          string,
          {
            [key: string]: "source" | "target";
          }
        >;
      } = { types: {}, tables: {} };

      for (const model of models) {
        for (const column of model.fields) {
          if (column.kind === "object" && column.relationName) {
            if (column?.relationFromFields?.length && column?.relationToFields?.length) {
              if (!relations.tables[model.name]) relations.tables[model.name] = {};
              if (!relations.tables[column.type]) relations.tables[column.type] = {};

              relations.tables[model.name][column.relationFromFields[0]] = "source";
              relations.tables[column.type][column.relationToFields[0]] = "target";
            } else {
              relations.types[column.relationName] = column.isList ? "hasMany" : "hasOne";
            }
          }
        }
      }

      for (const model of models) {
        const sourceTableName = model.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const columns: any[] = [];

        for (const column of model.fields) {
          if (column.kind === "object" && column.relationName) {
            if (column?.relationFromFields?.length && column?.relationToFields?.length) {
              const targetTableName = column.type;

              const sourceHandle = column.relationFromFields[0];
              const targetHandle = column.relationToFields[0];

              const relation = relations.types[column.relationName];

              edges.push({
                id: `${sourceTableName}To${targetTableName}`,
                source: sourceTableName,
                target: targetTableName,
                sourceHandle,
                targetHandle,
                data: {
                  initialSourceHandle: sourceHandle,
                  initialTargetHandle: targetHandle,
                  relation
                },
                type: "smoothstep"
              });
            }

            columns.push({
              name: column.name,
              type: column.type,
              isList: column.isList,
              isRequired: column.isRequired,
              isUnique: column.isUnique,
              isId: column.isId,
              isReadOnly: column.isReadOnly,
              hasDefaultValue: column.hasDefaultValue,
              default: column.default,
              isGenerated: column.isGenerated,
              isUpdatedAt: column.isUpdatedAt,
              backgroundColor: "rgb(225 242 255)"
            });
          } else {
            const handleType = relations.tables[model.name]?.[column.name];

            if (!handleType) {
              columns.push({
                name: column.name,
                type: column.type,
                isList: column.isList,
                isRequired: column.isRequired,
                isUnique: column.isUnique,
                isId: column.isId,
                isReadOnly: column.isReadOnly,
                hasDefaultValue: column.hasDefaultValue,
                default: column.default,
                isGenerated: column.isGenerated,
                isUpdatedAt: column.isUpdatedAt
              });
            } else {
              columns.push({
                name: column.name,
                type: column.type,
                isList: column.isList,
                isRequired: column.isRequired,
                isUnique: column.isUnique,
                isId: column.isId,
                isReadOnly: column.isReadOnly,
                hasDefaultValue: column.hasDefaultValue,
                default: column.default,
                isGenerated: column.isGenerated,
                isUpdatedAt: column.isUpdatedAt,
                handleType
              });
            }
          }
        }

        const position = await ApiService.getPosition(model.name);

        nodes.push({
          id: model.name,
          data: {
            name: model.name,
            dbName: model.dbName,
            columns
          },
          position,
          draggable: true,
          type: "table"
        });
      }

      setNodes(() => nodes);
      setEdges(() => edges);
    };

    generate();
  }, [models]);

  return (
    <ReactFlowProvider>
      {nodes && nodes?.length !== 0 && edges && edges?.length !== 0 && (
        <Flow key={JSON.stringify([...nodes, ...edges])} nodes={nodes} edges={edges} />
      )}
    </ReactFlowProvider>
    // <pre>{JSON.stringify(database, null, 2)}</pre>
  );
};
