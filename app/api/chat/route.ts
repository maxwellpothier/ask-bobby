import {NextResponse} from "next/server";
import {getEmbedding, getRelatedChunks, askClaude} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {question} = await req.json();
		const embeddedQuestion = await getEmbedding(question);
		const chunksToRef = await getRelatedChunks(embeddedQuestion);
		const claudeResponse = await askClaude(
			question,
			chunksToRef.map(chunk => chunk.chunk)
		);
		const videoInfo = chunksToRef.map(chunk => ({
			title: chunk.videoTitle,
			url: chunk.videoUrl,
		}));
		return NextResponse.json({
			answer: claudeResponse,
			videoInfo: videoInfo,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{error: "An error occurred while processing your question."},
			{status: 500}
		);
	}
};
