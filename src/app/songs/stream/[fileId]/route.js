import { streamDriveMp3 } from "@/lib/drive/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_request, { params }) {
  const { fileId } = await params;
  try {
    const streamed = await streamDriveMp3(fileId);
    return new Response(streamed.body, {
      status: streamed.status,
      headers: streamed.headers,
    });
  } catch (error) {
    return Response.json(
      {
        status: "fail",
        message: error.message || "Could not play this song.",
      },
      { status: 400 }
    );
  }
}
