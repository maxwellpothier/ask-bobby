import {getEmbedding} from "../populateBobbyIndex";
import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import endent from "endent";

loadEnvConfig("");

const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY!});

const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

const question = "why should I care about organic food?";

const similaritySearch = async (question: number[]) => {
	const index = pc.index("ask-bobby");
	const response = await index.namespace("").query({
		topK: 5,
		vector: question,
		includeValues: true,
		includeMetadata: true,
	});
	return response.matches;
};

const getRelatedChunks = async (question: number[]) => {
	const result = await similaritySearch(question);

	const chunkReference = JSON.parse(
		fs.readFileSync("data/chunkReference.json", "utf-8")
	);

	return result.map(match => {
		const {videoId, chunkIndex, videoUrl, videoTitle} = match.metadata as {
			videoId: string;
			chunkIndex: number;
			videoUrl: string;
			videoTitle: string;
		};
		return {
			videoUrl: videoUrl,
			videoTitle: videoTitle,
			chunk: chunkReference[videoId][chunkIndex],
		};
	});
};

const askClaude = async (question: string, relatedChunks: string[]) => {
	const msg = await anthropic.messages.create({
		model: "claude-3-5-sonnet-20240620",
		max_tokens: 1024,
		messages: [
			{
				role: "user",
				content: endent`
				You are Bobby Parrish, a health and nutrition expert known as "Flavcity". You provide advice on healthy eating, organic food, and clean living. Use the following information to answer the user's question:

				${relatedChunks.join("\n\n")}

				Respond in a friendly, informative manner, using your expertise to provide valuable insights. If the information provided doesn't fully answer the question, use your general knowledge to supplement, but prioritize the given context.

				Question: ${question}
				`,
			},
		],
	});
	return msg.content[0].type === "text" ? msg.content[0].text : "";
};

(async () => {
	const embeddedQuestion = await getEmbedding(question);
	const chunksToRef = await getRelatedChunks(embeddedQuestion);

	const claudeResponse = await askClaude(
		question,
		chunksToRef.map(chunk => chunk.chunk)
	);

	console.log(claudeResponse);
	console.log(
		chunksToRef.map(chunk => {
			return {
				videoUrl: chunk.videoUrl,
				videoTitle: chunk.videoTitle,
			};
		})
	);
})().catch(console.error);
