import { NextApiRequest, NextApiResponse } from "next";

import { createHash } from "node:crypto";

import fs from "fs";

export const config = {
  api: {
    bodyParser: {
      bodyParser: true
    }
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const positionsHash = createHash("sha256");
  if (process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA) {
    positionsHash.update(process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA);
  }

  const positionsPath = `data/positions/${positionsHash.digest("hex")}.json`;
  if (!fs.existsSync(positionsPath)) fs.writeFileSync(positionsPath, JSON.stringify({}));

  const positions = JSON.parse(fs.readFileSync(positionsPath, "utf8"));

  if (req.method === "POST") {
    try {
      positions[req.query.nodeId as string] = req.body;
      fs.writeFileSync(positionsPath, JSON.stringify(positions));

      res.status(200).json(positions[req.query.nodeId as string] || { x: 0, y: 0 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(200).json({});
    }
  }

  if (req.method === "GET") {
    try {
      res.status(200).json(positions[req.query.nodeId as string] || { x: 0, y: 0 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(200).json({});
    }
  }
};

export default handler;
