var tag = document.createElement("script");
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubePlayerAPIReady() {
  player = new YT.Player("ytplayer", {
    height: "360",
    width: "640",
    videoId: "qF5nHgQSH-o",
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

var background = [
  "../assets/img/images/7heR4.gif",
  "../assets/img/images/cafe.gif",
  "../assets/img/images/car.gif",
  "../assets/img/images/cyberpunk.gif",
  "../assets/img/images/cyberpunk2.gif",
  "../assets/img/images/dog.gif",
  "../assets/img/images/download.gif",
  "../assets/img/images/ds.gif",
  "../assets/img/images/festival.gif",
  "../assets/img/images/ftfIron.jpg",
  "../assets/img/images/ftfIron2.jpg",
  "../assets/img/images/ftfIron2.jpg",
  "../assets/img/images/highway.gif",
  "../assets/img/images/houseMC.gif",
  "../assets/img/images/Japan8BitGifs.gif",
  "../assets/img/images/kitchenMC.gif",
  "../assets/img/images/mario.gif",
  "../assets/img/images/Minecraft_Aesthetic_Photo.gif",
  "../assets/img/images/Minecraft_Aesthetic.gif",
  "../assets/img/images/motel_pixel_art.gif",
  "../assets/img/images/pixel_art_cafe.gif",
  "../assets/img/images/pixel_art_gif_japan.gif",
  "../assets/img/images/retrowave_and_1980s_culture.gif",
  "../assets/img/images/roadgif.gif",
  "../assets/img/images/robo.gif",
  "../assets/img/images/roomgif_rain.gif",
  "../assets/img/images/ship.gif",
  "../assets/img/images/snowMC.gif",
  "../assets/img/images/YourName.gif",
];

const videoIds = [
  "qF5nHgQSH-o",
  "hbpph9CrJbs",
  "-DfHaOYeaqk",
  "xUW9wVKNjQA",
  "x0OLPEjna8A",
  "jfKfPfyJRdk",
  "ANkxRGvl1VY",
  "BH-SnQ8J1VU",
  "4xDzrJKXOOY",
  "F02iMCEEQWs",
  "kvn8N8HTqGE",
  "or2SriWNolI",
  "txvYcUGUzaQ",
  "TlWYgGyNnJo",
  "NunueetXpZI",
  "Ru8DQ5f5A6U",
  "_5jELltfi9U",
  "lySUrbGamhU",
  "NJuSStkIZBg",
];
let currentVideoIndex = 0;
var current = 1;

function onPlayerReady() {
  player.playVideo();
  document.getElementById("play").addEventListener("click", () => {
    player.playVideo();
    current = 1;
  });
  document.getElementById("next").addEventListener("click", () => {
    player.playVideo();
    current = 1;
  });
  document.getElementById("previous").addEventListener("click", () => {
    player.playVideo();
    current = 1;
  });

  document.getElementById("pause").addEventListener("click", () => {
    player.pauseVideo();
    current = 0;
  });
}

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
  if (current == 1) {
    document.getElementById("static").innerText = "playing";
    document.getElementById("header").innerText = "(∪.∪ )...zzz";
  } else {
    document.getElementById("static").innerText = "paused";
    document.getElementById("header").innerText = "^_^";
  }
}

function getFullScreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullscreenElement ||
    document.msFullscreenElement
  );
}

function toggleFullScreen() {
  if (getFullScreenElement()) {
    document.exitFullscreen();
    document.getElementById("full_screen").innerText = "full_screen";
  } else {
    document.documentElement.requestFullscreen().catch(console.log);
    document.getElementById("full_screen").innerText = "exit";
  }
}

document.getElementById("full_screen").addEventListener("click", () => {
  toggleFullScreen();
});

document.getElementById("myRange").addEventListener("change", () => {
  player.setVolume(document.getElementById("myRange").value);
})