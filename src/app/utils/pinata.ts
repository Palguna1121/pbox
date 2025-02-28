import { PinataSDK } from "pinata";
import "server-only";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!,
});

export async function uploadFileToPinata(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload ke Pinata
    const fileObject = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      arrayBuffer: async () => await file.arrayBuffer(),
    };
    const uploadResult = await pinata.upload.file(fileObject, {
      metadata: {
        name: file.name,
      },
    });

    // Generate URL menggunakan gateway
    const imageUrl = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${uploadResult.cid}`;

    return imageUrl;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload image");
  }
}
