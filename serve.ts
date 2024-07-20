import express from 'express';
import cors from 'cors';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port, default to 3000

// Initialize embeddings with environment variable for base URL
const embeddings = new OllamaEmbeddings({
    model: process.env.EMBEDDINGS_MODEL || "nomic-embed-text",
    baseUrl: process.env.EMBEDDINGS_BASE_URL || "http://localhost:11434",
});

// Middleware setup
app.use(cors());
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
});
app.use(limiter);

// Function to fetch vector embedding
async function fetchVectorEmbedding(text: string): Promise<number[]> {
    return embeddings.embedQuery(text);
}

// Endpoint to handle POST requests for embeddings
app.post('/embed', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    try {
        const embedding = await fetchVectorEmbedding(text);
        res.json({ embedding });
    } catch (error) {
        console.error('Error fetching vector embedding:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});