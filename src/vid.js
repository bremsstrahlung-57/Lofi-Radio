(() => {
  "use strict";

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
  const backgrounds = [
    "ascii-rest-alpine-dawn.gif",
    "ascii-rest-aurora-fjord.gif",
    "ascii-rest-cloud-sea.gif",
    "ascii-rest-deep-reef.gif",
    "ascii-rest-desert-night.gif",
    "ascii-rest-earthrise.gif",
    "ascii-rest-gangaur-ghat.gif",
    "ascii-rest-kyoto-dusk.gif",
    "ascii-rest-lake-pichola.gif",
    "ascii-rest-lantern-lake.gif",
    "ascii-rest-marine-drive.gif",
    "ascii-rest-misty-forest.gif",
    "ascii-rest-night-coast.gif",
    "ascii-rest-night-highway.gif",
    "ascii-rest-ocean-sunset.gif",
    "ascii-rest-saturn-rise.gif",
    "ascii-rest-snow-train.gif",
    "ascii-rest-storm-plains.gif",
    "ascii-rest-varanasi-ghats.gif",
    "cafe.gif",
    "car.gif",
    "cybercafe.gif",
    "cyberpunk.gif",
    "cyberpunk2.gif",
    "dog.gif",
    "drifting_Away.jpg",
    "ds.gif",
    "festival.gif",
    "ftfIron.jpg",
    "ftfIron2.jpg",
    "highway.gif",
    "houseMC.gif",
    "Japan8BitGifs.gif",
    "kitchenMC.gif",
    "lanternMC.gif",
    "mario.gif",
    "Minecraft_Aesthetic_Photo.gif",
    "Minecraft_Aesthetic.gif",
    "motel_pixel_art.gif",
    "pixel_art_cafe.gif",
    "pixel_art_gif_japan.gif",
    "retrowave_and_1980s_culture.gif",
    "roadgif.gif",
    "robo.gif",
    "roomgif_rain.gif",
    "ship.gif",
    "snowMC.gif",
    "YourName.gif",
  ];
  const elements = Object.fromEntries(
    [
      "song-list",
      "song-help",
      "background-list",
      "random-background",
      "songs-toggle",
      "songs-panel",
      "songs-close",
      "backgrounds-toggle",
      "backgrounds-panel",
      "backgrounds-close",
      "backgrounds-previous",
      "backgrounds-next",
      "previous",
      "play",
      "pause",
      "next",
      "myRange",
      "full_screen",
      "ui-toggle",
      "static",
      "header",
    ].map((id) => [id, document.getElementById(id)])
  );
  const playbackControls = [
    elements.previous,
    elements.play,
    elements.pause,
    elements.next,
    elements.myRange,
  ];
  let player;
  let currentVideoIndex = 0;
  let currentBackground = "car.gif";

  let metadataStarted = false;
  let backgroundsRendered = false;
  const songCards = [];
  const backgroundCards = [];

  function createCard(className, title, imageUrl) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-pressed", "false");
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    const label = document.createElement("span");
    label.textContent = title;
    button.append(image, label);
    return { button, image, label };
  }

  function updateSelection(cards, selectedIndex) {
    cards.forEach(({ button }, index) => {
      button.setAttribute("aria-pressed", String(index === selectedIndex));
    });
  }

  videoIds.forEach((id, index) => {
    const card = createCard(
      "song-card",
      `Mix ${index + 1} · loading title…`,
      `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
    );
    card.button.disabled = true;
    card.button.addEventListener("click", () => selectSong(index));
    songCards.push(card);
    playbackControls.push(card.button);
    elements["song-list"].append(card.button);
  });
  updateSelection(songCards, currentVideoIndex);

  async function loadSongMetadata() {
    if (metadataStarted) return;
    metadataStarted = true;
    elements["song-help"].textContent = "Loading titles from YouTube…";
    let nextIndex = 0;
    let failures = 0;
    async function worker() {
      while (nextIndex < videoIds.length) {
        const index = nextIndex++;
        const card = songCards[index];
        try {
          const videoUrl = `https://www.youtube.com/watch?v=${videoIds[index]}`;
          const response = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(
              videoUrl
            )}&format=json`,
            { signal: AbortSignal.timeout(10000) }
          );
          if (!response.ok) throw new Error("YouTube metadata unavailable");
          const data = await response.json();
          if (!data.title) throw new Error("YouTube title unavailable");
          card.label.textContent = data.title;
          card.button.title = data.title;
          if (data.thumbnail_url) card.image.src = data.thumbnail_url;
        } catch {
          failures++;
          if (card.label.textContent.includes("loading title…")) {
            card.label.textContent = `Mix ${index + 1} · title unavailable`;
          }
        }
      }
    }
    // Limit requests while populating the full playlist, without loading extra players.
    await Promise.all([worker(), worker(), worker()]);
    elements["song-help"].textContent = failures
      ? "Some titles unavailable. You can still try each mix."
      : "Choose a mix. Scroll to explore.";
  }

  function renderBackgrounds() {
    if (backgroundsRendered) return;
    backgroundsRendered = true;
    backgrounds.forEach((filename) => {
      const label = filename
        .replace(/\.[^.]+$/, "")
        .replace(/^ascii-rest-/, "ASCII · ")
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2");
      const card = createCard(
        "background-card",
        label,
        `assets/img/images/${filename}`
      );
      card.button.title = label;
      card.button.addEventListener("click", () => {
        elements["random-background"].checked = false;
        changeBackground(filename);
      });
      backgroundCards.push(card);
      elements["background-list"].append(card.button);
    });
    updateSelection(backgroundCards, backgrounds.indexOf(currentBackground));
  }

  function setDrawer(name, open, restoreFocus = false) {
    elements[`${name}-panel`].hidden = !open;
    elements[`${name}-toggle`].hidden = open;
    elements[`${name}-toggle`].setAttribute("aria-expanded", String(open));
    if (open) {
      elements[`${name}-close`].focus();
      if (name === "songs") loadSongMetadata();
      else renderBackgrounds();
    } else if (restoreFocus) {
      elements[`${name}-toggle`].focus();
    }
  }

  ["songs", "backgrounds"].forEach((name) => {
    elements[`${name}-toggle`].addEventListener("click", () => {
      const open = elements[`${name}-panel`].hidden;
      setDrawer(name === "songs" ? "backgrounds" : "songs", false);
      setDrawer(name, open);
    });
    elements[`${name}-close`].addEventListener("click", () => {
      setDrawer(name, false, true);
    });
    document.addEventListener("click", (event) => {
      if (
        !elements[`${name}-panel`].hidden &&
        !elements[`${name}-panel`].contains(event.target) &&
        !elements[`${name}-toggle`].contains(event.target)
      ) {
        setDrawer(name, false);
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    ["songs", "backgrounds"].forEach((name) => {
      if (!elements[`${name}-panel`].hidden) setDrawer(name, false, true);
    });
  });

  const backgroundList = elements["background-list"];
  elements["backgrounds-previous"].addEventListener("click", () => {
    backgroundList.scrollBy({ left: -backgroundList.clientWidth * 0.8 });
  });
  elements["backgrounds-next"].addEventListener("click", () => {
    backgroundList.scrollBy({ left: backgroundList.clientWidth * 0.8 });
  });
  backgroundList.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaX || !event.deltaY || event.ctrlKey) return;
      event.preventDefault();
      const unit =
        event.deltaMode === 1
          ? 20
          : event.deltaMode === 2
          ? backgroundList.clientWidth
          : 1;
      backgroundList.scrollLeft += event.deltaY * unit;
    },
    { passive: false }
  );

  let drag;
  let dragged = false;
  backgroundList.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragged = false;
    drag = { x: event.clientX, scroll: backgroundList.scrollLeft };
  });
  backgroundList.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (!dragged && Math.abs(distance) < 6) return;
    dragged = true;
    backgroundList.setPointerCapture(event.pointerId);
    backgroundList.classList.add("dragging");
    backgroundList.scrollLeft = drag.scroll - distance;
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
    backgroundList.addEventListener(type, () => {
      drag = null;
      backgroundList.classList.remove("dragging");
    });
  });
  backgroundList.addEventListener(
    "click",
    (event) => {
      if (!dragged || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    },
    true
  );

  function setStatus(text, playing = false) {
    elements.static.textContent = text;
    elements.header.textContent = playing ? "(∪.∪ )...zzz" : "^_^";
  }

  function changeBackground(filename) {
    if (!filename) {
      const alternatives = backgrounds.filter(
        (name) => name !== currentBackground
      );
      filename = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    currentBackground = filename;
    document.body.style.backgroundImage = `url("assets/img/images/${filename}")`;
    updateSelection(backgroundCards, backgrounds.indexOf(filename));
  }

  function selectSong(index) {
    currentVideoIndex = (index + videoIds.length) % videoIds.length;
    updateSelection(songCards, currentVideoIndex);
    setStatus("loading song…");
    player.loadVideoById(videoIds[currentVideoIndex]);
    // fixed: a chosen background must not be replaced when the song changes.
    if (elements["random-background"].checked) changeBackground();
  }

  elements.next.addEventListener("click", () =>
    selectSong(currentVideoIndex + 1)
  );
  elements.previous.addEventListener("click", () =>
    selectSong(currentVideoIndex - 1)
  );
  elements.play.addEventListener("click", () => player.playVideo());
  elements.pause.addEventListener("click", () => player.pauseVideo());
  elements.myRange.addEventListener("input", () => {
    player.setVolume(Number(elements.myRange.value));
  });

  elements["ui-toggle"].addEventListener("click", () => {
    const hidden = document.body.classList.toggle("ui-hidden");
    elements["ui-toggle"].textContent = hidden ? "show ui" : "hide ui";
    elements["ui-toggle"].setAttribute("aria-pressed", String(hidden));
  });

  elements.full_screen.hidden = !document.fullscreenEnabled;
  elements.full_screen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setStatus("fullscreen unavailable");
    }
  });
  document.addEventListener("fullscreenchange", () => {
    elements.full_screen.textContent = document.fullscreenElement
      ? "exit"
      : "full_screen";
  });

  window.onYouTubeIframeAPIReady = () => {
    player = new window.YT.Player("ytplayer", {
      height: "200",
      width: "200",
      videoId: videoIds[currentVideoIndex],
      playerVars: { autoplay: 1, playsinline: 1 },
      events: {
        onReady(event) {
          playbackControls.forEach((control) => {
            control.disabled = false;
          });
          setStatus("ready · press play");
          event.target.setVolume(Number(elements.myRange.value));
          event.target.playVideo();
        },
        onAutoplayBlocked() {
          setStatus("ready · press play");
        },
        onStateChange(event) {
          const states = {
            "-1": "ready · press play",
            0: "ended",
            1: "playing",
            2: "paused",
            3: "buffering…",
            5: "ready · press play",
          };
          setStatus(states[event.data] || "ready", event.data === 1);
          const data = event.target.getVideoData();
          const index = videoIds.indexOf(data.video_id);
          if (data.title && index !== -1) {
            songCards[index].label.textContent = data.title;
            songCards[index].button.title = data.title;
          }
          if (event.data === 0) selectSong(currentVideoIndex + 1);
        },
        onError() {
          setStatus("song unavailable · choose another");
        },
      },
    });
  };

  const apiScript = document.createElement("script");
  apiScript.src = "https://www.youtube.com/iframe_api";
  apiScript.async = true;
  apiScript.addEventListener("error", () => {
    setStatus("could not load YouTube · reload to retry");
  });
  document.head.append(apiScript);
})();
