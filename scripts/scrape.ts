import {Video} from "@/types";
import {YoutubeTranscript} from "youtube-transcript";
import {encode} from "gpt-3-encoder";

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

	// split the transcript into chunks
	// we know the transcript is not going to fit in the max token limit (200)
	// how do we sparate the transcript into chunks of 200 tokens?

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

	// the content portion of videos is now populated
	console.log(videos);
})();
