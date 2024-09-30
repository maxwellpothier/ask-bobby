import {NextResponse} from "next/server";
import {getRelatedChunks} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {embedding} = await req.json();
		console.log("Should make it here...");
		const chunksToRef = await getRelatedChunks(embedding);
		console.log("Chunks to reference:", chunksToRef);

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
		return NextResponse.json({error: error}, {status: 500});
	}
};
