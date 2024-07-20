let queries = [];
let selectedQueryIndex = -1;

function checkEnter(event) {
    if (event.key === 'Enter') {
        submitText();
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const helpPopup = document.getElementById('helpPopup');
        if (helpPopup && helpPopup.style.display === 'block') {
            helpPopup.style.display = 'none';
        }
    }
}

// Add event listener for the Escape key
document.addEventListener('keydown', handleEscapeKey);

function toggleHelpPopup() {
    const helpPopup = document.getElementById('helpPopup');
    if (helpPopup.style.display === 'block') {
        helpPopup.style.display = 'none';
    } else {
        helpPopup.style.display = 'block';
    }
}

async function submitText() {
    const inputText = document.getElementById('inputText').value;
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('statusMessage');

    if (inputText.trim() === '') {
        return;
    }

    // Disable button and show status message
    submitButton.disabled = true;
    statusMessage.innerText = 'Retrieving embeddings...';

    try {
        const response = await fetch('http://localhost:3000/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        queries.push({ text: inputText, embedding: result.embedding });
        updateQueryList();

        const { data, layout } = renderPlot(queries, selectedQueryIndex);
        Plotly.newPlot('plot', data, layout);

        document.getElementById('inputText').value = ''; // Clear input field
    } catch (error) {
        Swal.fire({
            position: "bottom-end",
            icon: "error",
            title: "Cannot establish connection with server",
            showConfirmButton: false,
            timer: 1500,
            color: '#FFC995',
            position: 'top-end'
        });
    } finally {
        // Enable button and clear status message
        submitButton.disabled = false;
        statusMessage.innerText = '';
    }
}

function updateQueryList() {
    const queryList = document.getElementById('queryList');
    const sortOption = document.getElementById('sortOptions').value;
    queryList.style.display = 'block';

    // Calculate similarities if needed
    let similarities = [];
    if (selectedQueryIndex !== -1) {
        similarities = queries.map((query, index) => {
            if (index !== selectedQueryIndex) {
                return calculateCosineSimilarity(queries[selectedQueryIndex].embedding, query.embedding);
            }
            return null;
        });
    }

    // Sort queries
    let sortedQueries = queries.map((query, index) => ({ query, index }));
    if (sortOption === 'similarity' && selectedQueryIndex !== -1) {
        sortedQueries = sortedQueries.sort((a, b) => {
            if (a.index === selectedQueryIndex) return -1;
            if (b.index === selectedQueryIndex) return 1;
            return similarities[b.index] - similarities[a.index];
        });
    } else {
        sortedQueries = sortedQueries.sort((a, b) => a.index - b.index);
    }

    // Build query list
    queryList.innerHTML = '';
    sortedQueries.forEach(({ query, index }) => {
        const queryItem = document.createElement('div');
        queryItem.className = 'query-item';
        if (index === selectedQueryIndex) {
            queryItem.classList.add('selected');
        }

        let similarityText = '';
        if (selectedQueryIndex !== -1 && index !== selectedQueryIndex) {
            const similarity = similarities[index];
            similarityText = ` (Cosine Similarity: ${similarity.toFixed(2)})`;
        }

        queryItem.innerText = `${index + 1}. ${query.text}${similarityText}`;
        queryItem.onclick = () => selectQuery(index);

        queryList.appendChild(queryItem);
    });
}

function selectQuery(index) {
    if (selectedQueryIndex === index) {
        selectedQueryIndex = -1;
    } else {
        selectedQueryIndex = index;
    }
    updateQueryList();

    const { data, layout } = renderPlot(queries, selectedQueryIndex);
    Plotly.newPlot('plot', data, layout);
}

// Initial blank plot
window.onload = () => {
    const { data, layout } = renderPlot(queries, selectedQueryIndex);
    Plotly.newPlot('plot', data, layout);

};