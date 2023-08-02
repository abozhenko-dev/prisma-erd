import { NextApiRequest, NextApiResponse } from "next";

import { getDMMF } from "@prisma/internals";

import fs from "fs";

export const config = {
  api: {
    bodyParser: {
      bodyParser: true,
      responseLimit: false
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prismaSchemaPath = process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA;
    if (!prismaSchemaPath) throw new Error("Path to prisma schema is not defined");

    const prismaSchema = fs.readFileSync(prismaSchemaPath, "utf-8");
    const prismaSchemaDMMF = await getDMMF({ datamodel: prismaSchema });

    res.status(200).json(prismaSchemaDMMF);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(200).json({});
  }
};

export default handler;
