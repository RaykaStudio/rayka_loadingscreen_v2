const playlist = [
    {
        title: "National Treasures",
        artist: "Drake",
        source: "music/drake.mp3",
        cover: "images/cover/drake.png"
    },
    {
        title: "The Box",
        artist: "Roddy Ricch",
        source: "music/ricch.mp3",
        cover: "images/cover/ricch.png"
    }
];

let currentIndex = 0;
let isPlaying = false;
let trackLikedStates = {}; 

const audio = document.getElementById('asccochi_hardware_audio');
const mainPlayer = document.getElementById('asccochi_motorcycle_race');
const toggleTrigger = document.getElementById('asccochi_submarine_diver');
const progressBg = document.getElementById('asccochi_crab_shell');
const progressFill = document.getElementById('asccochi_lobster_claw');
const timeCurrent = document.getElementById('asccochi_coral_reef');
const timeDuration = document.getElementById('asccochi_sea_sponge');
const volumeSlider = document.getElementById('asccochi_mouse_trap');
const likeTrackBtn = document.getElementById('asccochi_seal_fur');
const targetTitles = document.querySelectorAll('.asccochi_star_sun');
const targetArtists = document.querySelectorAll('.asccochi_comet_tail');
const targetCovers = document.querySelectorAll('.asccochi_planet_mars');
const themeToggleTrigger = document.getElementById('asccochi_galaxy_star');
const themeIcon = document.getElementById('rayka-moon-light');
const socialDockContainer = document.getElementById('asccochi_ocean_fish');
const socialDockTrigger = document.getElementById('asccochi_jungle_tree');
const mainAnnouncementContainer = document.getElementById('asccochi_piano_key');
const announcementToggleTrigger = document.getElementById('asccochi_drum_stick');

const loadTextEl = document.getElementById('asccochi_speaker_volume');
const loadPercentEl = document.getElementById('asccochi_microphone_mute');
const barFillEl = document.getElementById('asccochi_monitor_screen');
const usernameEl = document.querySelector('.rayka-garlic-bread');

function setRandomTrackIndex() {
    if (playlist.length <= 1) return 0;
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * playlist.length);
    } while (newIndex === currentIndex);
    return newIndex;
}

function initScreen() {
    currentIndex = Math.floor(Math.random() * playlist.length);
    loadTrack(currentIndex);
    if(audio) audio.volume = 0.3;

    const savedTheme = localStorage.getItem('rayka-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if(audio) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayUI();
            }).catch(() => {
                console.log("Autoplay synchronized.");
            });
        }
    }

    startSlideshow();
    initCustomCursor();
}

function loadTrack(index) {
    const track = playlist[index];
    if(!track) return;
    if(audio) audio.src = track.source;
    
    targetTitles.forEach(el => el.textContent = track.title);
    targetArtists.forEach(el => el.textContent = track.artist);
    targetCovers.forEach(el => el.src = track.cover);
    
    if(progressFill) progressFill.style.width = '0%';
    if(timeCurrent) timeCurrent.textContent = "0:00";

    syncLikeUI(index);
}

function updatePlayUI() {
    const playNodes = document.querySelectorAll('.asccochi_cell_wall');
    playNodes.forEach(node => {
        if(isPlaying) {
            node.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            node.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
}

function togglePlay() {
    if(!audio) return;
    if(isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play();
        isPlaying = true;
    }
    updatePlayUI();
}

function nextTrack() {
    currentIndex = setRandomTrackIndex();
    loadTrack(currentIndex);
    if(isPlaying && audio) audio.play();
}

function prevTrack() {
    currentIndex = setRandomTrackIndex();
    loadTrack(currentIndex);
    if(isPlaying && audio) audio.play();
}

function updateTimeline() {
    if (!audio || isNaN(audio.duration)) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    if(progressFill) progressFill.style.width = `${percent}%`;
    if(timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    if(timeDuration) timeDuration.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setProgress(e) {
    if(!audio || !progressBg) return;
    const width = progressBg.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (!isNaN(duration)) {
        audio.currentTime = (clickX / width) * duration;
    }
}

let currentSlideIndex = 0;
const slides = document.querySelectorAll('.rayka-watermelon-sky .rayka-banana-juice');

function startSlideshow() {
    if (slides.length === 0) return;
    setInterval(() => {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 5000); 
}

const handlers = {
    loadProgress(data) {
        if (loadPercentEl && barFillEl) {
            let percent = Math.floor(data.loadFraction * 100);
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;
            loadPercentEl.textContent = `${percent}%`;
            barFillEl.style.width = `${percent}%`;
        }
    },
    startInitFunctionOrder(data) {
        if (loadTextEl) loadTextEl.textContent = "Connecting to server...";
    },
    startDataFileEntries(data) {
        if (loadTextEl) loadTextEl.textContent = "Loading server assets...";
    },
    onLogLine(data) {
        if (loadTextEl && data.message) {
            let cleanMsg = data.message.length > 35 ? data.message.substring(0, 35) + "..." : data.message;
            loadTextEl.textContent = cleanMsg;
        }
    }
};

window.addEventListener('message', function(e) {
    if (handlers[e.data.eventName]) {
        handlers[e.data.eventName](e.data);
    }
});

if (window.nuiHandoverData) {
    const handover = window.nuiHandoverData;
    if (handover.name && usernameEl) {
        usernameEl.textContent = handover.name;
    }
}

function initCustomCursor() {
    const cursor = document.querySelector('.rayka-joystick-pad');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const setupHoverEffects = () => {
        const interactiveTargets = document.querySelectorAll(
            'button, a, input, [id*="asccochi_"], [class*="rayka-"], .asccochi_cell_wall, .asccochi_dna_helix, .asccochi_gene_code'
        );
        
        interactiveTargets.forEach(el => {
            el.removeEventListener('mouseenter', addHoverClass);
            el.removeEventListener('mouseleave', removeHoverClass);
            el.addEventListener('mouseenter', addHoverClass);
            el.addEventListener('mouseleave', removeHoverClass);
        });
    };

    function addHoverClass() { cursor.classList.add('hovered'); }
    function removeHoverClass() { cursor.classList.remove('hovered'); }

    setupHoverEffects();
    setInterval(setupHoverEffects, 2000);
}

if (likeTrackBtn) {
    likeTrackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        trackLikedStates[currentIndex] = !trackLikedStates[currentIndex];
        syncLikeUI(currentIndex);
    });
}

function syncLikeUI(index) {
    if (!likeTrackBtn) return;
    if (trackLikedStates[index]) {
        likeTrackBtn.classList.add('liked');
        likeTrackBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
        likeTrackBtn.classList.remove('liked');
        likeTrackBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

if (themeToggleTrigger) {
    themeToggleTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        let targetTheme = 'dark';
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            targetTheme = 'light';
        }
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('rayka-theme', targetTheme);
        updateThemeIcon(targetTheme);
    });
}

function updateThemeIcon(theme) {
    if (!themeIcon || !themeToggleTrigger) return;
    if (theme === 'light') {
        themeIcon.className = 'fa-solid fa-sun';
        themeToggleTrigger.style.transform = 'rotate(180deg)';
    } else {
        themeIcon.className = 'fa-solid fa-moon';
        themeToggleTrigger.style.transform = 'rotate(0deg)';
    }
}

if (socialDockTrigger) {
    socialDockTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if(socialDockContainer) socialDockContainer.classList.toggle('expanded');
    });
}

if (announcementToggleTrigger && mainAnnouncementContainer) {
    announcementToggleTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        mainAnnouncementContainer.classList.toggle('expanded');
    });
}

document.addEventListener('click', () => {
    if (socialDockContainer) socialDockContainer.classList.remove('expanded');
    if (mainAnnouncementContainer) mainAnnouncementContainer.classList.remove('expanded');
});

if (socialDockContainer) socialDockContainer.addEventListener('click', (e) => e.stopPropagation());
if (mainAnnouncementContainer) mainAnnouncementContainer.addEventListener('click', (e) => e.stopPropagation());

if (toggleTrigger && mainPlayer) {
    toggleTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        mainPlayer.classList.toggle('expanded');
    });
}

document.querySelectorAll('.asccochi_cell_wall').forEach(btn => btn.addEventListener('click', togglePlay));
document.querySelectorAll('.asccochi_gene_code').forEach(btn => btn.addEventListener('click', nextTrack));
document.querySelectorAll('.asccochi_dna_helix').forEach(btn => btn.addEventListener('click', prevTrack));

if(audio) {
    audio.addEventListener('timeupdate', updateTimeline);
    audio.addEventListener('ended', nextTrack);
}

if (progressBg) progressBg.addEventListener('click', setProgress);
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => { 
        if(audio) audio.volume = e.target.value; 
    });
}

window.addEventListener('DOMContentLoaded', initScreen);