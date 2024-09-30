import {NextResponse} from "next/server";
import {getRelatedChunks} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {embedding} = await req.json();
		const chunksToRef = await getRelatedChunks(embedding);

		if (!chunksToRef || chunksToRef.length === 0) {
			return NextResponse.json(
				{error: "No related chunks found."},
				{status: 500}
			);
		}

		const videoInfo = chunksToRef.map(chunk => ({
			title: chunk.videoTitle,
			url: chunk.videoUrl,
			chunk: chunk.chunk,
		}));

		return NextResponse.json({videoInfo});
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json(
			{error: "An error occurred while searching for related chunks."},
			{status: 500}
		);
	}
};
