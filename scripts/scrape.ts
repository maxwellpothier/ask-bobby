import { YoutubeTranscript } from "youtube-transcript";

const videoIds = [
	"Am95bSANQJg", // The BEST Anti-Inflammatory Foods At The Grocery Store...And What To Avoid!
	"oKPTeVGR-eA", // 10 Healthy Grocery Items To Buy At Walmart Supercenter...And What To Avoid!
];

const fetchTranscript = async (videoId: string) => {
  const scriptChunks = await YoutubeTranscript.fetchTranscript(`https://www.youtube.com/watch?v=${videoId}`);
  const transcript = scriptChunks.map(chunk => chunk.text);

  console.log(transcript);
};

videoIds.forEach(id => fetchTranscript(id));