import sharp from "sharp";

export const privateImageOutputMaxBytes = 2 * 1024 * 1024;

export async function normalizePrivateImageBuffer(
  input: Buffer,
  options: { maxDimension: number }
) {
  const metadata = await sharp(input, {
    animated: false,
    limitInputPixels: 40_000_000
  }).metadata();

  if (
    !metadata.format ||
    !["jpeg", "png", "webp"].includes(metadata.format) ||
    (metadata.pages ?? 1) > 1
  ) {
    throw new Error("unsupported_image");
  }

  const firstPass = await renderWebp(input, options.maxDimension, 82);
  const output = firstPass.data.byteLength <= privateImageOutputMaxBytes
    ? firstPass
    : await renderWebp(input, options.maxDimension, 68);

  if (
    output.data.byteLength > privateImageOutputMaxBytes ||
    !output.info.width ||
    !output.info.height
  ) {
    throw new Error("output_too_large");
  }

  return output;
}

function renderWebp(input: Buffer, maxDimension: number, quality: number) {
  return sharp(input, {
    animated: false,
    limitInputPixels: 40_000_000
  })
    .autoOrient()
    .resize({
      fit: "inside",
      height: maxDimension,
      width: maxDimension,
      withoutEnlargement: true
    })
    .webp({ effort: 4, quality })
    .toBuffer({ resolveWithObject: true });
}
