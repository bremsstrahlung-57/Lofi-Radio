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
  "https://i.pinimg.com/originals/ba/6d/5f/ba6d5f62d7bb1263a97b56631bd29e28.gif",
  "https://i.pinimg.com/originals/4f/f0/88/4ff088795aff41e835671f1479fa0366.gif",
  "https://i.pinimg.com/originals/86/c1/d9/86c1d9ace129663aa292a68fb889e80c.gif",
  "https://i.pinimg.com/originals/43/1c/e5/431ce5d15aab86f66a91ec9a07c9114f.gif",
  "https://i.pinimg.com/originals/13/7e/45/137e45c33cb5939abcd3ff4d8f858c63.gif",
  "https://i.pinimg.com/originals/6d/78/71/6d78711d7c8438405ee8a5a50114f9ac.gif",
  "https://i.pinimg.com/originals/1c/4a/45/1c4a4596912277e7b3b209f1ccf49927.gif",
  "https://i.pinimg.com/originals/bf/fe/eb/bffeeb6e56305a13708c87d3df45a178.gif",
  "https://i.pinimg.com/originals/53/0d/48/530d48aed30ade25448afa74d8a2959f.gif",
  "https://i.pinimg.com/originals/bd/ec/4b/bdec4b1e34dc84a380e58f596766182d.gif",
  "https://i.pinimg.com/originals/74/63/59/74635989b770a38189fff31a8ef152ea.gif",
  "https://i.pinimg.com/originals/6f/d8/7b/6fd87b4c10f7538b5c530c53ad5ae844.gif",
  "https://i.pinimg.com/originals/41/60/61/416061b9d95e206d7bbeb51e644cca6e.gif",
  "https://i.pinimg.com/originals/ae/3f/99/ae3f993fd9ad5eb43319642e5e754e23.gif",
  "https://i.pinimg.com/originals/6e/85/f7/6e85f7e0111ac569249afb790efff78f.gif",
  "https://i.pinimg.com/originals/5f/f4/58/5ff45883d083027e28142ce6fc48659d.gif",
  "https://i.pinimg.com/originals/58/78/9f/58789f8e2d65c06f1218141cc8cd1db1.gif",
  "https://i.pinimg.com/originals/c6/33/c2/c633c20ede82f0e0ced7d570dbe3a1f3.gif",
  "https://i.pinimg.com/originals/40/01/14/400114aa763dcdff9aad8cf0d7194ba7.gif",
  "https://i.pinimg.com/originals/26/45/47/2645475a9eef90f4a1fe67b76ae7d9fa.gif",
  "https://i.pinimg.com/originals/79/d6/40/79d6400bad7992c811d56cb90d0beed2.gif",
  "https://i.pinimg.com/originals/09/24/4c/09244c7f7dd4d17b0484370f32db6641.gif",
  "https://i.pinimg.com/736x/74/7e/05/747e05f5b08220c6c69e0842a78209c5.jpg",
  "https://i.pinimg.com/736x/4c/81/71/4c81715af51aabe175143a7148ae88fb.jpg",
  "https://i.pinimg.com/originals/df/6b/e2/df6be2153e2b2a255e7e707da5e4c02c.gif",
  "https://i.pinimg.com/originals/28/c8/56/28c856331b4ae6ce0f27dfb5671ba71e.gif",
  "https://i.pinimg.com/originals/b0/a5/40/b0a5403e757bd83e02131c4d2e82c351.gif",
  "https://i.pinimg.com/originals/ff/7d/eb/ff7deb7e7e4b8a42e7aff7c592e35b8b.gif",
  "https://i.pinimg.com/originals/c0/cd/4c/c0cd4c0e4d5c280e34571db01b2dcfde.gif",
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