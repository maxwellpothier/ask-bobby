import {ProcessedVideo, ChunkReference} from "@/types";
import {getData} from "./chunkTranscript";
import fs from "fs";
import path from "path";
import {chunkTranscript} from "./chunkTranscript";

const chunkReference: ChunkReference = {};

(async () => {
	const videos: ProcessedVideo[] = getData();

	for (const video of videos) {
		const chunkedText: string[] = await chunkTranscript(video.transcript);
		chunkReference[video.videoId] = chunkedText;
	}

	const outputPath = path.join(process.cwd(), "data", "chunkReference.json");
	fs.writeFileSync(outputPath, JSON.stringify(chunkReference, null, 2));
	console.log("Chunk reference saved to chunkReference.json");
})().catch(console.error);
