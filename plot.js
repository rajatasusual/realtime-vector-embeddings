function renderPlot(queries, selectedQueryIndex) {
    const data = queries.map((query, index) => {
        const trace = {
            x: query.embedding.map((_, idx) => idx),
            y: query.embedding,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Query ${index + 1}`,
            marker: {
                color: index === selectedQueryIndex ?
                    ['#1A2A73', '#35A1CB', '#ACE2F9'][index % 3] :
                    ['#1A2A7350', '#35A1CB50', '#ACE2F950'][index % 3],
                opacity: index === selectedQueryIndex ? 1 : 0.5 // Full opacity for selected, translucent for others
            },
            line: {
                width: index === selectedQueryIndex ? 2 : 1,
                shape: 'spline',
                color: index === selectedQueryIndex ? ['#1A2A73', '#35A1CB', '#ACE2F9'][index % 3] : ['#1A2A7350', '#35A1CB50', '#ACE2F950'][index % 3]
            },
            text: index !== selectedQueryIndex && selectedQueryIndex !== -1 ?
                query.embedding.map((_, i) => `Query ${index + 1} Similarity: ${calculateCosineSimilarity(queries[selectedQueryIndex].embedding, query.embedding).toFixed(2)}`) :
                [],
            textposition: 'top center',
            hoverinfo: 'x+y+text'
        };

        if (index === selectedQueryIndex || selectedQueryIndex === -1) {
            return trace;
        } else {
            const cosineSimilarity = calculateCosineSimilarity(queries[selectedQueryIndex].embedding, query.embedding);
            return [
                trace,
                {
                    x: [0, query.embedding.length - 1],
                    y: [cosineSimilarity, cosineSimilarity],
                    type: 'scatter',
                    name: `Query ${index + 1} Similarity: ${cosineSimilarity.toFixed(2)}`,
                    marker: { color: '#FFC995' },
                    line: { dash: 'dot', width: 1 }
                }
            ];
        }
    }).flat();

    const layout = {
        title: 'Vector Embeddings',
        xaxis: {
            title: 'Index'
        },
        yaxis: {
            title: 'Value'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#1A2A73'
        }
    };

    return {data, layout};
}

function calculateCosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((acc, val, idx) => acc + val * vec2[idx], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

module.exports = { renderPlot, calculateCosineSimilarity };