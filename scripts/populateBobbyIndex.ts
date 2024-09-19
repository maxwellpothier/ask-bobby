import {Pinecone} from "@pinecone-database/pinecone";
import {loadEnvConfig} from "@next/env";

loadEnvConfig("");

const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});

const indexName = "ask-bobby";
