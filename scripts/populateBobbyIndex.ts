// import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";
// import {ProcessedVideo, EmbeddedVideo} from "@/types";
// import {chunkTranscript, getData} from "./chunkTranscript";
import OpenAI from "openai";

loadEnvConfig("");

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

// const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

// const index = pc.index("ask-bobby");

// const upsertToBobby = async (video: EmbeddedVideo): Promise<void> => {
// 	for (let j = 0; j < video.embeddings.length; j++) {
// 		await index.upsert([
// 			{
// 				id: `${video.videoId}-chunk-${j}`,
// 				values: video.embeddings[j],
// 				metadata: {
// 					videoId: video.videoId,
// 					videoTitle: video.title,
// 					videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
// 					chunkIndex: j,
// 				},
// 			},
// 		]);
// 	}
// 	console.log(`Upserted embeddings for video: ${video.title}`);
// };

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

// (async () => {
// 	const videos: ProcessedVideo[] = getData();

// 	console.log("Got videos");

// 	const embeddedVideos: EmbeddedVideo[] = [];

// 	for (const video of videos) {
// 		const chunkedText = await chunkTranscript(video.transcript);
// 		const embeddings = [];
// 		for (const chunk of chunkedText) {
// 			const embedding = await getEmbedding(chunk);
// 			embeddings.push(embedding);
// 		}

// 		embeddedVideos.push({
// 			videoId: video.videoId,
// 			title: video.title,
// 			date: video.date,
// 			embeddings: embeddings,
// 		});

// 		console.log("got embedding for video " + video.videoId);
// 	}

// 	for (const embeddedVideo of embeddedVideos) {
// 		await upsertToBobby(embeddedVideo);
// 	}
// })().catch(console.error);
