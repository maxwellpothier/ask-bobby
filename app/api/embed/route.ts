import {NextResponse} from "next/server";
import {getEmbedding} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {question} = await req.json();
		const embeddedQuestion = await getEmbedding(question);

		if (!embeddedQuestion || embeddedQuestion.length === 0) {
			return NextResponse.json(
				{error: "Failed to generate embedding for the question."},
				{status: 500}
			);
		}

		return NextResponse.json({embedding: embeddedQuestion});
	} catch (error) {
		console.error("Embedding error:", error);
		return NextResponse.json(
			{error: "An error occurred while embedding the question."},
			{status: 500}
		);
	}
};
