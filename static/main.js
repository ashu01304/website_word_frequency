function analyzeUrl() {
    const url = document.getElementById('url-input').value;
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    const table = document.getElementById('word-table');
    const resultSection = document.getElementById('result');
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    // Clear previous results and errors
    hideError();
    table.style.display = 'none';
    loadingDiv.style.display = 'flex';
    resultSection.style.display = 'none';

    // Disable the button and show loading state
    const button = document.querySelector('.analyze-btn');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    // Send request to backend
    $.ajax({
        url: '/analyze',
        method: 'POST',
        data: { url: url },
        success: function(response) {
            loadingDiv.style.display = 'none';
            resultSection.style.display = 'block';
            if (response.words) {
                displayResults(response.words);
            }
        },
        error: function(xhr) {
            loadingDiv.style.display = 'none';
            const response = xhr.responseJSON;
            showError(response?.error || 'An error occurred while analyzing the webpage');
        },
        complete: function() {
            // Reset button state
            button.disabled = false;
            button.innerHTML = '<span class="btn-text">Analyze</span><i class="fas fa-arrow-right"></i>';
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.animation = 'none';
    errorDiv.offsetHeight; // Trigger reflow
    errorDiv.style.animation = 'fadeIn 0.3s ease';
}

function hideError() {
    const errorDiv = document.getElementById('error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function displayResults(words) {
    const tbody = document.querySelector('#word-table tbody');
    tbody.innerHTML = '';
    
    let totalFrequency = words.reduce((sum, [_, freq]) => sum + freq, 0);
    
    words.forEach(([word, frequency], index) => {
        const row = document.createElement('tr');
        row.className = 'table-row-animation';
        row.style.animationDelay = `${index * 0.05}s`;
        
        const percentage = ((frequency / totalFrequency) * 100).toFixed(1);
        
        row.innerHTML = `
            <td>${word}</td>
            <td>${frequency}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });

    // Update stats
    document.getElementById('total-words').textContent = totalFrequency;

    // Show the table with animation
    const table = document.getElementById('word-table');
    table.style.display = 'table';
    table.style.animation = 'fadeIn 0.5s ease';
}

// Add input validation and URL formatting
document.getElementById('url-input').addEventListener('input', function(e) {
    let url = e.target.value.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    e.target.value = url;
});