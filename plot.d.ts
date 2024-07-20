// plot.d.ts

/**
 * Renders a plot of vector embeddings.
 * @param queries - An array of query objects where each object contains `text` and `embedding`.
 * @param selectedQueryIndex - The index of the currently selected query, or -1 if none.
 * @returns An object containing `data` and `layout` for the Plotly plot.
 */
declare function renderPlot(queries: { text: string; embedding: number[] }[], selectedQueryIndex: number, smoothData: boolean = false): { data: any[], layout: any };

/**
 * Calculates the cosine similarity between two vectors.
 * @param vec1 - The first vector.
 * @param vec2 - The second vector.
 * @returns The cosine similarity between the two vectors.
 */
declare function calculateCosineSimilarity(vec1: number[], vec2: number[]): number;

export { renderPlot, calculateCosineSimilarity };