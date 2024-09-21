import fs from "fs";
import path from "path";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
// import {ProcessedVideo} from "@/types";

export const getData = () => {
	const dataPath = path.join(process.cwd(), "data", "processedVideos.json");

	// Read the JSON file
	const rawData = fs.readFileSync(dataPath, "utf-8");
	return JSON.parse(rawData);
};

export const chunkTranscript = async (
	transcript: string
): Promise<string[]> => {
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	});

	const chunks = await textSplitter.splitText(transcript);
	return chunks;
};

// (async () => {
// 	const videos: ProcessedVideo[] = getData();

// 	console.log(await chunkTranscript(videos[100].transcript));
// })().catch(console.error);
