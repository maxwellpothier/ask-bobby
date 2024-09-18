import fs from "fs";
import path from "path";
import he from "he";
import {ProcessedVideo} from "@/types";

// Function to clean up text (used for both transcript and title)
function cleanText(text: string): string {
	// Decode HTML entities
	let cleaned = he.decode(text);

	// Remove extra spaces
	cleaned = cleaned.replace(/\s+/g, " ");

	// Trim whitespace from start and end
	cleaned = cleaned.trim();

	// Add any other cleaning steps here

	return cleaned;
}

async function cleanTranscripts() {
	const dataPath = path.join(process.cwd(), "data", "processedVideos.json");

	// Read the JSON file
	const rawData = fs.readFileSync(dataPath, "utf-8");
	const videos: ProcessedVideo[] = JSON.parse(rawData);

	// Clean each transcript and title
	const cleanedVideos = videos.map(video => ({
		...video,
		transcript: cleanText(video.transcript),
		title: cleanText(video.title),
	}));

	console.log(cleanedVideos[0].transcript);
	console.log(cleanedVideos[0].title);

	// Save the cleaned data back to the original file
	fs.writeFileSync(dataPath, JSON.stringify(cleanedVideos, null, 2));

	console.log(
		`Cleaned ${cleanedVideos.length} transcripts and titles. Saved to ${dataPath}`
	);
}

cleanTranscripts().catch(console.error);
