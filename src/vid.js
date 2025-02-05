var tag = document.createElement("script");
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubePlayerAPIReady() {
    player = new YT.Player("ytplayer", {
        height: "360",
        width: "640",
        videoId: "-DfHaOYeaqk",
        frameborder: 0,
        playerVars: {
            autoplay: 1,
            start: 0,
            playsinline: 1,
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
}

var current = 1;
function onPlayerReady() {
    document.getElementById("play").addEventListener("click", () => {
        player.playVideo();
        current = 1;
    });
    document.getElementById("pause").addEventListener("click", () => {
        player.pauseVideo();
        current = 0;
    });
}

var background = [
    "/lofi-radio/assets/img/Minecraft_Aesthetic_Photo.gif",
    "/lofi-radio/assets/img/7heR4.gif",
    "/lofi-radio/assets/img/Japan8BitGifs.gif",
    "/lofi-radio/assets/img/Minecraft_Aesthetic.gif",
    "/lofi-radio/assets/img/motel_pixel_art.gif",
    "/lofi-radio/assets/img/pixel_art_cafe.gif",
    "/lofi-radio/assets/img/pixel_art_gif_japan.gif",
    "/lofi-radio/assets/img/retrowave_and_1980s_culture.gif",
    "/lofi-radio/assets/img/roadgif.gif",
    "/lofi-radio/assets/img/roomgif_rain.gif",
];

const videoIds = [
  "-DfHaOYeaqk",
  "xUW9wVKNjQA",
  "x0OLPEjna8A",
  "jfKfPfyJRdk",
  "ANkxRGvl1VY",
  "BH-SnQ8J1VU",
  "zhDwjnYZiCo",
  "F02iMCEEQWs",
  "kvn8N8HTqGE",
  "or2SriWNolI",
  "txvYcUGUzaQ",
  "NunueetXpZI"
];
let currentVideoIndex = 0;

document.getElementById("next").addEventListener("click", () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoIds.length;
    player.loadVideoById(videoIds[currentVideoIndex]);
    background_image = background[Math.floor(Math.random() * background.length)];
    document.body.style.backgroundImage = `url('${background_image}')`;
});

document.getElementById("previous").addEventListener("click", () => {
    currentVideoIndex =
        (currentVideoIndex - 1 + videoIds.length) % videoIds.length;
    player.loadVideoById(videoIds[currentVideoIndex]);
    background_image = background[Math.floor(Math.random() * background.length)];
    document.body.style.backgroundImage = `url('${background_image}')`;
});

function onPlayerStateChange(event) {
    // console.log("Player state changed:", event.data, current);
    if (current == 1) {
        document.getElementById("static").innerText = "playing";
        document.getElementById("header").innerText = "(∪.∪ )...zzz";
        
    } else {
        document.getElementById("static").innerText = "paused";
        document.getElementById("header").innerText = "^_^";
    }
}

function getFullScreenElement(){
    return document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullscreenElement
        || document.msFullscreenElement
}

function toggleFullScreen(){
    if (getFullScreenElement()){
        document.exitFullscreen();
        document.getElementById("full_screen").innerText = "full_screen";
    } else {
        document.documentElement.requestFullscreen().catch(console.log);
        document.getElementById("full_screen").innerText = "exit";
    }
}

document.getElementById("full_screen").addEventListener("click", () => {
    toggleFullScreen();
})