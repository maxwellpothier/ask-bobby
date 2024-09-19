import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";

loadEnvConfig("");

const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

const indexName = "example-index";

const populateVectorDb = async () => {
	await pc.createIndex({
		name: indexName,
		dimension: 2,
		metric: "cosine",
		spec: {
			serverless: {
				cloud: "aws",
				region: "us-east-1",
			},
		},
	});
};

const upsertVectors = async (indexToUpsert: string) => {
	const index = pc.index(indexToUpsert);

	await index.namespace("example-namespace1").upsert([
		{
			id: "vec1",
			values: [1.0, 1.5],
		},
		{
			id: "vec2",
			values: [2.0, 1.0],
		},
		{
			id: "vec3",
			values: [0.1, 3.0],
		},
	]);

	await index.namespace("example-namespace2").upsert([
		{
			id: "vec1",
			values: [1.0, -2.5],
		},
		{
			id: "vec2",
			values: [3.0, -2.0],
		},
		{
			id: "vec3",
			values: [0.5, -1.5],
		},
	]);
};

const describeIndexStats = async (name: string) => {
	const index = pc.index(name);
	const stats = await index.describeIndexStats();
	console.log(stats);
};

const simSearch = async (name: string) => {
	const index = pc.index(name);
	const queryResponse1 = await index.namespace("example-namespace1").query({
		topK: 3,
		vector: [1.0, 1.5],
		includeValues: true,
	});

	const queryResponse2 = await index.namespace("example-namespace2").query({
		topK: 3,
		vector: [1.0, -2.5],
		includeValues: true,
	});

	console.log(queryResponse1);
	console.log(queryResponse2);
};

const deleteIndex = async () => {
	await pc.deleteIndex(indexName);
};

populateVectorDb().catch(console.error);
upsertVectors(indexName).catch(console.error);
describeIndexStats(indexName).catch(console.error);
simSearch(indexName).catch(console.error);
deleteIndex().catch(console.error);
console.log("Done!");
