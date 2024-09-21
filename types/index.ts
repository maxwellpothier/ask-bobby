export type ProcessedVideo = {
	videoId: string;
	title: string;
	date: string;
	transcript: string;
};

export type EmbeddedVideo = {
	videoId: string;
	title: string;
	date: string;
	embeddings: number[][];
};
export type ChunkReference = {
	[videoId: string]: string[];
};
