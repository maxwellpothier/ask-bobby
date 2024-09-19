import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";

loadEnvConfig("");

const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

const indexName = "ask-bobby";

const getEmbeddings = async (chunks: string[]) => {};

const upsertToBobby = async (embeddings: number[][]) => {};

(async () => {
	const embeddings = await getEmbeddings(["Hello, world!"]);

	await upsertToBobby(embeddings);
})().catch(console.error);
