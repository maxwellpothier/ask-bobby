import {NextResponse} from "next/server";
import {getEmbedding, getRelatedChunks, askClaude} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {question} = await req.json();

		let embeddedQuestion;
		try {
			embeddedQuestion = await getEmbedding(question);
			if (!embeddedQuestion || embeddedQuestion.length === 0) {
				throw new Error("Empty embedding result");
			}
		} catch (error) {
			console.error("Embedding error:", error);
			return NextResponse.json(
				{error: "Failed to generate embedding for the question."},
				{status: 500}
			);
		}

		let chunksToRef;
		try {
			chunksToRef = await getRelatedChunks(embeddedQuestion);
			if (!chunksToRef || chunksToRef.length === 0) {
				throw new Error("No related chunks found");
			}
		} catch (error) {
			console.error("Related chunks error:", error);
			return NextResponse.json(
				{error: "Failed to retrieve related chunks."},
				{status: 500}
			);
		}

		let claudeResponse;
		try {
			claudeResponse = await askClaude(
				question,
				chunksToRef.map(chunk => chunk.chunk)
			);
			if (!claudeResponse) {
				throw new Error("Empty response from Claude");
			}
		} catch (error) {
			console.error("Claude response error:", error);
			return NextResponse.json(
				{error: "Failed to get a response from Claude."},
				{status: 500}
			);
		}

		const videoInfo = chunksToRef.map(chunk => ({
			title: chunk.videoTitle,
			url: chunk.videoUrl,
		}));

		return NextResponse.json({
			answer: claudeResponse,
			videoInfo: videoInfo,
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{
				error: "An unexpected error occurred while processing your question.",
			},
			{status: 500}
		);
	}
};
