import multer from "multer";
import sharp from "sharp";
import { NextApiRequest, NextApiResponse } from "next";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

// Helper function to run multer
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest & { file: Express.Multer.File },
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Handle the file upload
    await runMiddleware(req, res, upload.single("image"));

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get border percentages from query parameters
    const xPercent = parseFloat(req.query.x as string) || 10; // default 10%
    const yPercent = parseFloat(req.query.y as string) || 10; // default 10%

    // Load the image using sharp
    const image = sharp(req.file.buffer);

    // Get the image metadata
    const metadata = await image.metadata();

    if (!metadata) {
      res.json({ error: "Error processing image" });
      throw new Error("idk");
    }

    // Calculate border sizes
    const horizontalBorder = Math.round((metadata.width! * xPercent) / 100);
    const verticalBorder = Math.round((metadata.height! * yPercent) / 100);

    // Process the image
    const processedImage = await image
      .extend({
        top: verticalBorder,
        bottom: verticalBorder,
        left: horizontalBorder,
        right: horizontalBorder,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // white background
      })
      .toBuffer();

    // Set the appropriate headers
    res.setHeader("Content-Type", `image/${metadata.format}`);
    res.setHeader("Content-Disposition", "inline");

    // Send the processed image
    res.status(200).send(processedImage);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Error processing image" });
  }
}
