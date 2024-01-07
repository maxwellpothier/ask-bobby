import {MyJson, Video} from "@/types";
import {YoutubeTranscript} from "youtube-transcript";
import {encode, decode} from "gpt-3-encoder";
import fs from "fs";

const CHUNK_SIZE = 200;

const videos: Video[] = [
	{
		id: "Am95bSANQJg",
		title: "The BEST Anti-Inflammatory Foods At The Grocery Store...And What To Avoid!",
		content: "",
		tokens: 0,
		chunks: [],
	},
	{
		id: "oKPTeVGR-eA",
		title: "10 Healthy Grocery Items To Buy At Walmart Supercenter...And What To Avoid!",
		content: "",
		tokens: 0,
		chunks: [],
	},
];

const getChunks = (video: Video) => {
	const {id, title, content} = video;

	let videoTextChunks: string[] = [];
	const tokens = encode(content);

	for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
		const chunkTokens = tokens.slice(i, i + CHUNK_SIZE);
		const chunkText = decode(chunkTokens);
		videoTextChunks.push(chunkText);
	}

	return videoTextChunks.map(chunk => ({
		video_id: id,
		video_title: title,
		content: chunk,
		content_tokens: encode(chunk).length,
		embedding: [],
	}));
};

const fetchTranscript = async (video: Video) => {
	const scriptChunks = await YoutubeTranscript.fetchTranscript(
		`https://www.youtube.com/watch?v=${video.id}`
	);
	const transcript = scriptChunks.map(chunk => chunk.text).join(" ");
	video.content = transcript;
	video.tokens = encode(transcript).length;
	video.chunks = getChunks(video);
};

(async () => {
	await Promise.all(videos.map(video => fetchTranscript(video)));

	const json: MyJson = {
		tokens: videos.reduce((acc, video) => acc + video.tokens, 0),
		videos,
	};

	fs.writeFileSync("scripts/bobby.json", JSON.stringify(json));
})();
