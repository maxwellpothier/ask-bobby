import {google} from "googleapis";
import {YoutubeTranscript} from "youtube-transcript";
import {loadEnvConfig} from "@next/env";
import {ProcessedVideo} from "@/types";
import fs from "fs";
import path from "path";

loadEnvConfig("");

const youtube = google.youtube({
	version: "v3",
	auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelVideos(channelId: string): Promise<ProcessedVideo[]> {
	const processedVideos: ProcessedVideo[] = [];
	let pageToken: string | undefined;

	do {
		const response = await youtube.search.list({
			part: ["snippet"],
			channelId: channelId,
			type: ["video"],
			maxResults: 50,
			pageToken: pageToken,
		});

		if (response.data.items) {
			for (const item of response.data.items) {
				if (item.id?.videoId && item.snippet) {
					processedVideos.push({
						videoId: item.id.videoId,
						title: item.snippet.title || "",
						date: item.snippet.publishedAt || "",
						transcript: "",
					});
				}
			}
		}

		pageToken = response.data.nextPageToken || undefined;
	} while (pageToken);

	return processedVideos;
}

async function getVideoTranscript(
	video: ProcessedVideo
): Promise<ProcessedVideo | null> {
	try {
		const transcript = await YoutubeTranscript.fetchTranscript(
			video.videoId
		);
		video.transcript = transcript
			.map((entry: {text: string}) => entry.text)
			.join(" ");

		return video;
	} catch (error) {
		console.error(
			`Error fetching transcript for video ${video.videoId}:`,
			error
		);
		return null;
	}
}

async function fetchAndProcessVideos() {
	const videos = await getChannelVideos(process.env.YOUTUBE_CHANNEL_ID!);

	const firstTranscript = await getVideoTranscript(videos[0]);
	console.log(firstTranscript);

	const processedData: ProcessedVideo[] = [];

	for (const video of videos) {
		console.log(`Processing video ${video.videoId}...`);
		const processedVideo = await getVideoTranscript(video);
		if (processedVideo) {
			processedData.push(processedVideo);
			console.log("Pushed!");
		}
	}

	console.log(processedData);

	// Save processed data to a JSON file
	const dataDir = path.join(process.cwd(), "data");
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir);
	}
	fs.writeFileSync(
		path.join(dataDir, "processedVideos.json"),
		JSON.stringify(processedData, null, 2)
	);

	console.log(`Processed ${processedData.length} videos.`);
}

fetchAndProcessVideos().catch(console.error);
