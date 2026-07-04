// Get all the necessary DOM elements for manipulation
const audio = new Audio(); // Create a new HTML Audio element
const songCover = document.getElementById('song-cover'); // Album cover image element
const songTitle = document.getElementById('song-title'); // Song title heading element
const artistName = document.getElementById('artist-name'); // Artist name paragraph element
const progressBar = document.getElementById('progress-bar'); // Seekable progress bar element
const currentTimeEl = document.getElementById('current-time'); // Current time display element
const totalDurationEl = document.getElementById('total-duration'); // Total duration display element
const playPauseBtn = document.getElementById('play-pause-btn'); // Play/Pause button element
const playPauseIcon = document.getElementById('play-pause-icon'); // Play/Pause icon element
const prevBtn = document.getElementById('prev-btn'); // Previous track button element
const nextBtn = document.getElementById('next-btn'); // Next track button element
const volumeSlider = document.getElementById('volume-slider'); // Volume slider element
const muteBtn = document.getElementById('mute-btn'); // Mute/Unmute button element
const volumeIcon = document.getElementById('volume-icon'); // Volume icon element
const playlistEl = document.getElementById('playlist'); // Playlist container element
const errorAlert = document.getElementById('error-alert'); // Error alert element

// State variables to manage the player's status
let isPlaying = false; // A boolean to track if music is currently playing
let currentTrackIndex = 0; // The index of the currently playing song in the playlist
let volumeBeforeMute = 1; // A variable to store the volume level before muting

// The playlist data: an array of objects
const playlist = [
    {
        title: "Drop it - Track 1",
        src: "music/drop-it-124014.mp3", // Corrected file path
        cover: "music/images.jpeg" // Corrected file path
    },
    {
        title: "Hold Me Tight Track 2",
       
        src: "music/hold-me-tight-278286.mp3", // Corrected file path
        cover: "music/images.jpeg" // Corrected file path
    },
    {
        title: "Romantic song Track 3",
        src: "music/romantic-song-tera-roothna-by-ashir-hindi-top-trending-viral-song-231771.mp3", // Corrected file path
        cover: "music/images.jpeg" // Corrected file path
    },
    {
        title: "Tere Sang  Track 4",
      
        src: "music/tere-sang-with-you-207644.mp3", // Corrected file path
        cover: "music/images.jpeg" // Corrected file path
    },
    {
        title: "Trending Track 5",
        src: "music/-382944.mp3", // Corrected file path
        cover: "music/images.jpeg" // Corrected file path
    }
];

// --- Helper Functions ---

// Formats a time in seconds to a string like "M:SS"
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60); // Get the number of full minutes
    const secs = Math.floor(seconds % 60); // Get the remaining seconds
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Return formatted string with a leading zero if needed
};

// --- Player Control Functions ---

// Loads a track into the audio player and updates the UI
const loadTrack = (index) => {
    // Check if the provided index is valid
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index; // Update the current track index
    const track = playlist[currentTrackIndex]; // Get the track object from the playlist
    
    audio.src = track.src; // Set the audio source to the track's source URL
    songTitle.textContent = track.title; // Update the song title on the UI
    artistName.textContent = track.artist; // Update the artist name
    songCover.src = track.cover; // Update the album cover image
    
    // Reset progress bar and time displays
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    totalDurationEl.textContent = '0:00';

    // Highlight the active track in the playlist
    renderPlaylist();
    // Update button disable state
    updateButtonStates();
};

// Toggles between play and pause states
const playPauseTrack = () => {
    if (isPlaying) {
        audio.pause(); // Pause the audio
        playPauseIcon.classList.replace('bi-pause-fill', 'bi-play-fill'); // Change icon to 'play'
        playPauseBtn.setAttribute('aria-label', 'Play track'); // Update accessibility label
    } else {
        // Attempt to play the audio and handle any playback errors
        audio.play().catch(e => {
            console.error("Playback failed:", e); // Log any playback errors
            showErrorAlert(); // Show an error alert to the user
            nextTrack(); // Automatically skip to the next track
        });
        playPauseIcon.classList.replace('bi-play-fill', 'bi-pause-fill'); // Change icon to 'pause'
        playPauseBtn.setAttribute('aria-label', 'Pause track'); // Update accessibility label
    }
    isPlaying = !isPlaying; // Toggle the playing state
};

// Plays the next track in the playlist
const nextTrack = () => {
    // Calculate the next index, looping back to the start if at the end
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex); // Load the next track
    if (isPlaying) {
        audio.play(); // If a song was playing, start playing the new one
    }
};

// Plays the previous track in the playlist
const prevTrack = () => {
    // Calculate the previous index, looping to the end if at the start
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(prevIndex); // Load the previous track
    if (isPlaying) {
        audio.play(); // If a song was playing, start playing the new one
    }
};

// Shows a temporary error alert to the user
const showErrorAlert = () => {
    errorAlert.classList.remove('d-none'); // Make the alert visible
    // Hide the alert after 5 seconds
    setTimeout(() => {
        errorAlert.classList.add('d-none');
    }, 5000);
};

// Updates the progress bar and current time display based on audio playback
const updateProgress = () => {
    const { duration, currentTime } = audio; // Destructure properties from the audio element
    // Set the progress bar value as a percentage of the total duration
    progressBar.value = (currentTime / duration) * 100 || 0;
    // Update the current time display
    currentTimeEl.textContent = formatTime(currentTime);
    // Only update total duration if it's available (not NaN)
    if (duration && !isNaN(duration)) {
        totalDurationEl.textContent = formatTime(duration);
    }
};

// Seeks to a new position in the track when the user interacts with the progress bar
const seek = () => {
    // Calculate the new time based on the progress bar's percentage value
    audio.currentTime = (progressBar.value / 100) * audio.duration;
};

// Toggles the mute state of the audio
const toggleMute = () => {
    if (audio.muted) {
        audio.muted = false; // Unmute the audio
        volumeSlider.value = volumeBeforeMute; // Restore the volume to the value before muting
    } else {
        volumeBeforeMute = audio.volume; // Store the current volume before muting
        audio.muted = true; // Mute the audio
        volumeSlider.value = 0; // Set the slider to 0
    }
    // Update the icon based on the new mute state
    updateVolumeIcon();
};

// Updates the volume and the volume icon based on the slider value
const setVolume = () => {
    audio.volume = volumeSlider.value; // Set the audio volume to the slider's value
    audio.muted = false; // Ensure audio is not muted if the slider is moved
    updateVolumeIcon(); // Update the icon to reflect the new volume level
};

// Updates the volume icon (up, down, or mute)
const updateVolumeIcon = () => {
    if (audio.muted || audio.volume === 0) {
        volumeIcon.classList.replace('bi-volume-up-fill', 'bi-volume-mute-fill');
        volumeIcon.classList.remove('bi-volume-down-fill');
    } else if (audio.volume < 0.5) {
        volumeIcon.classList.replace('bi-volume-up-fill', 'bi-volume-down-fill');
        volumeIcon.classList.remove('bi-volume-mute-fill');
    } else {
        volumeIcon.classList.replace('bi-volume-down-fill', 'bi-volume-up-fill');
        volumeIcon.classList.remove('bi-volume-mute-fill');
    }
};

// Disables or enables the prev/next buttons based on the current track index
const updateButtonStates = () => {
    prevBtn.disabled = currentTrackIndex === 0; // Disable 'prev' if at the first song
    nextBtn.disabled = currentTrackIndex === playlist.length - 1; // Disable 'next' if at the last song
};

// Dynamically renders the playlist and highlights the active track
const renderPlaylist = () => {
    playlistEl.innerHTML = ''; // Clear the existing playlist to prevent duplicates
    playlist.forEach((song, index) => {
        // Create a new list item element
        const listItem = document.createElement('li');
        // Add Bootstrap classes for styling and the 'active' class if it's the current track
        listItem.className = `list-group-item d-flex justify-content-between align-items-center ${index === currentTrackIndex ? 'active' : ''}`;
        // Set the inner HTML with song title and artist
        listItem.innerHTML = `
            <div>
                <h6 class="mb-1">${song.title}</h6>
                <p class="mb-0 small text-muted">${song.artist}</p>
            </div>
            ${index === currentTrackIndex ? '' : '<i class="bi bi-play-circle-fill"></i>'}
        `;
        // Add a click event listener to each playlist item
        listItem.addEventListener('click', () => {
            loadTrack(index); // Load the clicked track
            if (isPlaying) {
                audio.play(); // If the player was already playing, start the new track
            }
        });
        playlistEl.appendChild(listItem); // Append the new item to the playlist container
    });
};

// --- Event Listeners ---

// Listen for clicks on the play/pause button
playPauseBtn.addEventListener('click', playPauseTrack);

// Listen for clicks on the next button
nextBtn.addEventListener('click', nextTrack);

// Listen for clicks on the previous button
prevBtn.addEventListener('click', prevTrack);

// Listen for the 'timeupdate' event on the audio element to update the UI in real-time
audio.addEventListener('timeupdate', updateProgress);

// Listen for the 'loadedmetadata' event when a new song is loaded
audio.addEventListener('loadedmetadata', () => {
    updateProgress(); // Initial progress bar update
});

// Listen for the 'ended' event when a song finishes
audio.addEventListener('ended', () => {
    // Check if it's the last song
    if (currentTrackIndex < playlist.length - 1) {
        nextTrack(); // If not the last song, play the next one
    } else {
        // If it's the last song, reset the player
        isPlaying = false;
        playPauseIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
        audio.currentTime = 0; // Reset to the beginning of the last song
    }
});

// Listen for user input on the progress bar to seek
progressBar.addEventListener('input', seek);

// Listen for user input on the volume slider to change volume
volumeSlider.addEventListener('input', setVolume);

// Listen for clicks on the mute button
muteBtn.addEventListener('click', toggleMute);

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // Prevent default behavior if the user is typing in an input field or button
    if (e.target.matches('input') || e.target.matches('button')) {
        return;
    }
    
    switch (e.key) {
        case ' ': // Spacebar for play/pause
            e.preventDefault(); // Prevent the page from scrolling
            playPauseTrack();
            break;
        case 'ArrowRight': // Right arrow to seek forward by 5 seconds
            audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
            break;
        case 'ArrowLeft': // Left arrow to seek backward by 5 seconds
            audio.currentTime = Math.max(audio.currentTime - 5, 0);
            break;
        case 'ArrowUp': // Up arrow to increase volume by 10%
            audio.volume = Math.min(1, audio.volume + 0.1);
            volumeSlider.value = audio.volume;
            setVolume(); // Ensure the icon updates
            break;
        case 'ArrowDown': // Down arrow to decrease volume by 10%
            audio.volume = Math.max(0, audio.volume - 0.1);
            volumeSlider.value = audio.volume;
            setVolume(); // Ensure the icon updates
            break;
    }
});

// --- Initial Setup ---
// When the page is loaded, load the first track and render the playlist
document.addEventListener('DOMContentLoaded', () => {
    loadTrack(currentTrackIndex); // Load the first song when the page loads
    renderPlaylist(); // Display the playlist on the page
});