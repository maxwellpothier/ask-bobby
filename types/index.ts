export type Video = {
	id: string;
	title: string;
	content: string;
	tokens: number;
	chunks: VideoChunk[];
};

export type VideoChunk = {
	video_id: string;
	video_title: string;
	content: string;
	content_tokens: number;
	embedding: number[];
};

export type MyJson = {
	tokens: number;
	videos: Video[];
};
