/* For room.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.
// Allow changing the name of a room


document.addEventListener('DOMContentLoaded', function() {
    // Check if the user information exists
    if (typeof WATCH_PARTY_API_KEY !== 'undefined') {
        // Add the API key to all fetch requests
        const apiKey = WATCH_PARTY_API_KEY;
        fetchWithApiKey(apiKey);
    } else {
        console.error('WATCH_PARTY_API_KEY is undefined.');
    }
});

function fetchWithApiKey(apiKey) {
    // Save the original fetch function
    const originalFetch = window.fetch;

    // Override the fetch function with a wrapper
    window.fetch = function(resource, init) {
        // Check if request headers are already set
        init = init || {};
        init.headers = init.headers || {};
        // Add the API key to request headers
        init.headers['X-API-Key'] = apiKey;
        // Call the original fetch function with the modified arguments
        return originalFetch(resource, init);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const messagesElement = document.querySelector('.messages');

    console.log("DOMContentLoaded");

    if (messagesElement != null) {
        const roomId = messagesElement.getAttribute('data-room-id');
        console.log("Dom roomId " + roomId);
        if (roomId) {
            clearChatHistory();
            startMessagePolling(roomId);
            postMessage(roomId);
        } else {
            console.error('Room ID is undefined');
        }
    } else {
        console.error('No element with class "messages" found');
    }

});


function initializeProfilePage() {
    console.log("initializeProfilePage");

    const updateUsernameButton = document.querySelector('.updateUsername');
    const usernameInput = document.querySelector('.usernameInput');
    console.log("updateUsernameButton:  " + updateUsernameButton);
    if (updateUsernameButton) {
        console.log("updateUsernameButton");
        updateUsernameButton.addEventListener('click', async () => {
            const newUsername = usernameInput.value;
            console.log('Update username button clicked');
            const userId = WATCH_PARTY_USER_ID;
            try {
                const response = await fetch('/api/user/name', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id:userId, username: newUsername })
                });
                if (response.ok) {
                    console.log('Username updated successfully');
                    document.getElementById('usernameUpdateSuccessMessage').style.display = 'block';
                    // Optionally, you can update the UI to reflect the changes
                } else {
                    console.error('Failed to update username');
                }
            } catch (error) {
                console.error('Error updating username:', error);
            }
        });
    }

    const updatePasswordButton = document.querySelector('.updatePassword');
    const passwordInput = document.querySelector('.passwordInput');
    console.log("updatePasswordButton:  " + updatePasswordButton);
    if (updatePasswordButton) {
        console.log("updatePasswordButton");
        updatePasswordButton.addEventListener('click', async () => {
            const newPassword = passwordInput.value;
            console.log('Update password button clicked');
            const userId = WATCH_PARTY_USER_ID;
            try {
                const response = await fetch('/api/user/password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: userId, password: newPassword })
                });
                if (response.ok) {
                    console.log('Password updated successfully');
                    document.getElementById('passwordUpdateSuccessMessage').style.display = 'block';
                    // Optionally, you can update the UI to reflect the changes
                } else {
                    console.error('Failed to update password');
                }
            } catch (error) {
                console.error('Error updating password:', error);
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
    // Get necessary DOM elements
    const editLink = document.querySelector('.roomData .display a');
    const editSection = document.querySelector('.roomData .edit');
    const roomNameInput = document.querySelector('.roomData .edit input');
    if (editLink != null) {
        // Add event listener for the "edit" link
        editLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Show the edit section and hide the display section
            editSection.classList.remove('hide');
            this.closest('h3').classList.add('hide');

            // Populate the room name into the input field
            roomNameInput.value = document.querySelector('.roomData .roomName').textContent;
        });
    }

    if (editSection != null) {
        // Add event listener for the "save" link
        editSection.querySelector('a').addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Send request to update the room name
            const roomId = document.querySelector('.roomData').getAttribute('data-room-id');
            const newRoomName = roomNameInput.value;
            fetch(`/api/room/name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({room_name: newRoomName, room_id: roomId})
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update room name');
                    }
                    return response.json();
                })
                .then(data => {
                    // Update the room name display
                    document.querySelector('.roomData .roomName').textContent = newRoomName;

                    // Show the display section and hide the edit section
                    editSection.classList.add('hide');
                    editLink.closest('h3').classList.remove('hide');
                })
                .catch(error => {
                    console.error('Error updating room name:', error);
                });
        });
    }
});


function postMessage(roomId) {
    const form = document.querySelector('.comment_box form');

    // Add an event listener to the form for submitting messages
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the message content from the textarea
        const message = form.querySelector('textarea[name="comment"]').value;
        const user_id = document.querySelector('.comment_box').getAttribute('user-id');


        // Send a POST request to the backend API to post the message
        fetch(`/api/room/${roomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convert the message content to JSON and send it in the request body
            body: JSON.stringify({ message: message.toString(), user_id: user_id })
        })
            .then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error('Failed to post message');
                }
                // Parse the JSON response
                return response.json();
            })
            .then(data => {
                // Handle successful posting of the message, e.g., update the UI
                console.log('Message posted successfully:', data);
            })
            .catch(error => {
                // Handle errors, e.g., display an error message to the user
                console.error('Error posting message:', error);
            });
    });
}

function startMessagePolling(roomId) {
    let roomId1 = roomId;
    console.log("RoomId1: " + roomId1);
  setInterval(function() {
      console.log("RoomId2: " + roomId1);
      console.log("RoomId3: " + roomId);
    displayRoomMessages(roomId1);
  }, 100); // Poll every 100 ms;
}

// Function: Fetch messages from API for a specific chat room and display them on the page
function displayRoomMessages(roomId) {
    if (roomId !== undefined) {
    console.log("displayRoomMessages:  " + roomId);
    fetch(`/api/room/${roomId}/messages`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch room messages');
            }
            return response.json();
        })
        .then(messages => {
            const chatHistory = document.querySelector('.messages');
            chatHistory.innerHTML = '';
            console.log("messages: " + messages.author);
            messages.forEach(message => {
                const messageElement = document.createElement('message');
                messageElement.innerHTML = `
        <author>${message.user_id}</author>
        <content>${message.body}</content>
      `;
                chatHistory.appendChild(messageElement);
            });
        })
        .catch(error => console.error('Error fetching room messages:', error));
} }
function updateRoomName() {
  return;
}


/* For profile.html */

// TODO: Allow updating the username and password
// Function to update the username
function updateUsername(newUsername, userId) {
    fetch('/api/user/name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername, user_id: userId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update username');
            }
            return response.json();
        })
        .then(data => {
            console.log('Username updated successfully:', data);
            // You can update the UI here if needed
        })
        .catch(error => {
            console.error('Error updating username:', error);
        });
}

// Function to update the password
function updatePassword(newPassword, userId) {
    fetch('/api/user/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword, user_id: userId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update password');
            }
            return response.json();
        })
        .then(data => {
            console.log('Password updated successfully:', data);
            // You can update the UI here if needed
        })
        .catch(error => {
            console.error('Error updating password:', error);
        });
}

// Function to update the room name
function updateRoomName(newRoomName, roomId) {
    fetch('/api/room/name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ room_name: newRoomName, room_id: roomId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update room name');
            }
            return response.json();
        })
        .then(data => {
            console.log('Room name updated successfully:', data);
            // You can update the UI here if needed
        })
        .catch(error => {
            console.error('Error updating room name:', error);
        });
}


function clearChatHistory() {
    const chatHistory = document.querySelector('.messages');
    chatHistory.innerHTML = ''; // clear chat history
}