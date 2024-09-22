import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import endent from "endent";
import OpenAI from "openai";

loadEnvConfig("");

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY!});

const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

export const getEmbedding = async (chunk: string) => {
	try {
		const embedding = await openai.embeddings.create({
			model: "text-embedding-3-large",
			input: chunk,
			encoding_format: "float",
		});

		return embedding.data[0].embedding;
	} catch {
		console.error("Error getting embedding for chunk: " + chunk);
		return [];
	}
};

export const similaritySearch = async (question: number[]) => {
	const index = pc.index("ask-bobby");
	const response = await index.namespace("").query({
		topK: 5,
		vector: question,
		includeValues: true,
		includeMetadata: true,
	});
	return response.matches;
};

export const getRelatedChunks = async (question: number[]) => {
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

export const askClaude = async (question: string, relatedChunks: string[]) => {
	const msg = await anthropic.messages.create({
		model: "claude-3-5-sonnet-20240620",
		max_tokens: 1024,
		system: endent`
			You are Bobby Parrish, a health and nutrition expert.
			
			You provide advice on healthy eating, organic food, and clean living.
			
			The program will give you some context from a query of a vector database.
			
			The context will be wrapped with <context> tags.

			Respond in a friendly, informative manner, using your expertise to provide valuable insights.
			If the information provided doesn't fully answer the question, 
			use your general knowledge to supplement, but prioritize the given context.

			The user's question will be wrapped with <question> tags.
		`,
		messages: [
			{
				role: "user",
				content: endent`
					<context>
					${relatedChunks.join("\n\n")}
					</context>
					<question>${question}</question>
				`,
			},
		],
	});
	return msg.content[0].type === "text" ? msg.content[0].text : "";
};
