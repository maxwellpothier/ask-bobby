import {NextResponse} from "next/server";
import {askClaude} from "@/utils/chatUtils";

export const POST = async (req: Request) => {
	try {
		const {question, chunks} = await req.json();
		const claudeResponse = await askClaude(question, chunks);

		if (!claudeResponse) {
			return NextResponse.json(
				{error: "Empty response from Claude."},
				{status: 500}
			);
		}

		return NextResponse.json({answer: claudeResponse});
	} catch (error) {
		console.error("Claude response error:", error);
		return NextResponse.json(
			{error: "An error occurred while getting a response from Claude."},
			{status: 500}
		);
	}
};
