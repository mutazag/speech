// Include config.js before this file
// <script src="config.js"></script> should be added to HTML before including this file

// Function to fetch personal voices from the API
function getPersonalVoices() {
    // Use the config object loaded from config.js
    const list_personal_voices_url = `${config.endpoint}/customvoice/personalvoices?api-version=2024-02-01-preview`;
    const apiKey = config.speechKey;

    fetch(list_personal_voices_url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
            // Add any other required headers
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Filter for only successfully created voices - similar to your Python filter
        const successfulVoices = data.value.filter(voice => voice.status === 'Succeeded');

        // Process and display the voices
        displayVoices(successfulVoices);

        return successfulVoices;
    })
    .catch(error => {
        console.error('Error fetching personal voices:', error);
        document.getElementById('error-message').textContent = `Error: ${error.message}`;
        return [];
    });
}

// Function to display the voices in the UI
function displayVoices(voices) {
    const voicesContainer = document.getElementById('voices-container');
    voicesContainer.innerHTML = ''; // Clear previous content

    if (voices.length === 0) {
        voicesContainer.innerHTML = '<p>No successful personal voices found.</p>';
        return;
    }

    // Create a list of voices
    const voicesList = document.createElement('ul');
    voicesList.className = 'voices-list';

    voices.forEach(voice => {
        const voiceItem = document.createElement('li');

        // Format creation date
        const createdDate = new Date(voice.createdDateTime);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        voiceItem.innerHTML = `
            <div class="voice-item">
                <h3>${voice.displayName}</h3>
                <p>ID: ${voice.id}</p>
                <p>Created: ${formattedDate}</p>
                <button onclick="selectVoice('${voice.id}')">Select This Voice</button>
            </div>
        `;

        voicesList.appendChild(voiceItem);
    });

    voicesContainer.appendChild(voicesList);
}

// Function to select a voice for use
function selectVoice(voiceId) {
    console.log(`Selected voice ID: ${voiceId}`);
    // Store the selected voice ID in a variable or localStorage
    localStorage.setItem('selectedVoiceId', voiceId);
    document.getElementById('selected-voice').textContent = `Selected Voice ID: ${voiceId}`;

    // You can trigger other actions based on voice selection here
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add a button to manually refresh the list
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Voice List';
    refreshButton.onclick = getPersonalVoices;
    document.body.insertBefore(refreshButton, document.getElementById('voices-container'));

    // Initial fetch of voices
    getPersonalVoices();
});