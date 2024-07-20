import readline from 'readline';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import puppeteer from 'puppeteer';

import { renderPlot } from './plot';

// Initialize readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
});

// Function to fetch vector embedding
async function fetchVectorEmbedding(text: string): Promise<number[]> {
    try {
        return await embeddings.embedQuery(text);
    } catch (error) {
        console.error('Error fetching vector embedding:', error);
        throw error;
    }
}

const queries: { text: string, embedding: number[] }[] = [];
let currentInput = '';

console.log("Start typing to get vector embeddings in real-time (Press Ctrl+C to exit):");

// Event listener for user input
rl.on('line', async (input: string) => {
    currentInput += ' ' + input;
    if (input.trim() === '') return;
    try {
        const embedding = await fetchVectorEmbedding(currentInput.trim());
        console.log(`Current Input: ${currentInput.trim()}`);
        console.log(`Vector Embedding: ${JSON.stringify(embedding)}`);

        queries.push({ text: currentInput.trim(), embedding });

        // Always use the first query as the selected query
        await plotAllQueries();

        currentInput = ''; // Reset the input after processing
    } catch (error) {
        console.error('Error processing the input:', error);
    }
});

// Handle Ctrl+C to exit the program
rl.on('SIGINT', () => {
    console.log("\nExiting...");
    rl.close();
    process.exit(0);
});

// Function to plot all queries
async function plotAllQueries() {
    if (queries.length === 0) return;

    const { data, layout } = renderPlot(queries, 0, process.env.SMOOTH === 'true');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    </head>
    <body>
        <div id="plotly-div" style="width:800px;height:600px;"></div>
        <script>
            var data = ${JSON.stringify(data)};
            var layout = ${JSON.stringify(layout)};
            Plotly.newPlot('plotly-div', data, layout);
        </script>
    </body>
    </html>
    `;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'embedding_plot.png' });

        await browser.close();

        console.log('Plot saved as embedding_plot.png');
    } catch (error) {
        console.error('Error while rendering the plot:', error);
    }
}