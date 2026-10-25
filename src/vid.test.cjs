/* eslint-env node */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "vid.js"), "utf8");
const flush = () => new Promise((resolve) => setImmediate(resolve));

function setup(metadataFetch) {
  const elements = {};
  const requests = [];
  let document;
  function element(tagName) {
    const classes = new Set();
    return {
      tagName,
      disabled: false,
      hidden: false,
      checked: false,
      value: "",
      textContent: "",
      children: [],
      attributes: {},
      listeners: {},
      scrollLeft: 0,
      clientWidth: 500,
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
      },
      append(...children) {
        this.children.push(...children);
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      addEventListener(name, handler) {
        (this.listeners[name] ||= []).push(handler);
      },
      emit(name, event = {}) {
        this.listeners[name]?.forEach((handler) => handler(event));
      },
      contains(target) {
        return (
          this === target ||
          this.children.some((child) => child.contains(target))
        );
      },
      focus() {
        document.activeElement = this;
      },
      scrollBy({ left }) {
        this.scrollLeft += left;
      },
      setPointerCapture() {},
    };
  }
  document = {
    body: {
      style: {},
      classList: {
        toggle(name) {
          if (this[name]) {
            delete this[name];
            return false;
          }
          this[name] = true;
          return true;
        },
      },
    },
    head: {
      append(script) {
        document.script = script;
      },
    },
    documentElement: { requestFullscreen: async () => {} },
    fullscreenEnabled: true,
    listeners: {},
    addEventListener(name, handler) {
      (this.listeners[name] ||= []).push(handler);
    },
    emit(name, event = {}) {
      this.listeners[name]?.forEach((handler) => handler(event));
    },
    createElement: element,
    getElementById(id) {
      return (elements[id] ||= element("div"));
    },
  };
  for (const id of ["songs-panel", "backgrounds-panel"])
    document.getElementById(id).hidden = true;
  for (const id of ["previous", "next", "play", "pause", "myRange"])
    document.getElementById(id).disabled = true;
  document.getElementById("random-background").checked = true;
  document.getElementById("myRange").value = "100";
  const calls = [];
  let currentId = "qF5nHgQSH-o";
  const player = {
    loadVideoById(id) {
      currentId = id;
      calls.push(["load", id]);
    },
    setVolume(value) {
      calls.push(["volume", value]);
    },
    playVideo() {
      calls.push(["play"]);
    },
    pauseVideo() {
      calls.push(["pause"]);
    },
    getVideoData() {
      return { title: "Actual YouTube title", video_id: currentId };
    },
  };
  let config;
  const window = {
    YT: {
      Player: function (_id, options) {
        config = options;
        return player;
      },
    },
  };
  vm.runInNewContext(source, {
    document,
    window,
    AbortSignal,
    fetch: async (url) => {
      requests.push(url);
      if (metadataFetch) return metadataFetch(url);
      return {
        ok: true,
        json: async () => ({
          title: "YouTube API title",
          thumbnail_url: "https://i.ytimg.com/api-thumbnail.jpg",
        }),
      };
    },
  });
  return {
    document,
    elements,
    calls,
    player,
    requests,
    songs: elements["song-list"].children,
    ready() {
      window.onYouTubeIframeAPIReady();
      config.events.onReady({ target: player });
      return config.events;
    },
    open(name) {
      elements[`${name}-toggle`].emit("click");
    },
  };
}

function selected(cards) {
  return cards.findIndex((card) => card.attributes["aria-pressed"] === "true");
}

test("background tray lazily renders every image with no missing files or duplicates", () => {
  const app = setup();
  assert.equal(app.elements["background-list"].children.length, 0);
  app.open("backgrounds");
  const cards = app.elements["background-list"].children;
  const filenames = cards.map((card) => path.basename(card.children[0].src));
  assert.equal(new Set(filenames).size, filenames.length);
  assert.deepEqual(
    filenames.sort(),
    fs.readdirSync(path.join(__dirname, "../assets/img/images")).sort()
  );
  assert.equal(app.songs.length, 19);
});

test("playback and song cards stay disabled until YouTube is ready", () => {
  const app = setup();
  assert.equal(app.elements.play.disabled, true);
  assert.equal(app.songs[0].disabled, true);
  app.ready();
  assert.equal(app.elements.play.disabled, false);
  assert.equal(app.songs[0].disabled, false);
  app.calls.length = 0;
  app.elements.play.emit("click");
  app.elements.pause.emit("click");
  assert.deepEqual(app.calls, [["play"], ["pause"]]);
});

test("previous and next wrap and synchronize selected song cards", () => {
  const app = setup();
  app.ready();
  app.elements.previous.emit("click");
  assert.equal(selected(app.songs), 18);
  assert.deepEqual(app.calls.at(-1), ["load", "NJuSStkIZBg"]);
  app.elements.next.emit("click");
  assert.equal(selected(app.songs), 0);
});

test("clicking a song preserves a manually selected background", () => {
  const app = setup();
  app.ready();
  app.open("backgrounds");
  app.elements["background-list"].children[1].emit("click");
  const background = app.document.body.style.backgroundImage;
  assert.equal(app.elements["random-background"].checked, false);
  app.songs[5].emit("click");
  assert.deepEqual(app.calls.at(-1), ["load", "jfKfPfyJRdk"]);
  assert.equal(app.document.body.style.backgroundImage, background);
  assert.equal(selected(app.songs), 5);
});

test("random mode avoids repeating the current background", () => {
  const app = setup();
  app.ready();
  app.elements.next.emit("click");
  const background = app.document.body.style.backgroundImage;
  app.elements.next.emit("click");
  assert.notEqual(app.document.body.style.backgroundImage, background);
});

test("status uses player events, updates the correct title and advances on end", () => {
  const app = setup();
  const events = app.ready();
  events.onStateChange({ data: 1, target: app.player });
  assert.equal(app.elements.static.textContent, "playing");
  assert.equal(app.songs[0].children[1].textContent, "Actual YouTube title");
  events.onStateChange({ data: 2, target: app.player });
  assert.equal(app.elements.static.textContent, "paused");
  events.onStateChange({ data: 0, target: app.player });
  assert.equal(selected(app.songs), 1);
});

test("volume updates immediately and supports zero", () => {
  const app = setup();
  app.ready();
  app.elements.myRange.value = "0";
  app.elements.myRange.emit("input");
  assert.deepEqual(app.calls.at(-1), ["volume", 0]);
});

test("API, unavailable song and autoplay failures have actionable status", () => {
  const app = setup();
  app.document.script.emit("error");
  assert.match(app.elements.static.textContent, /reload to retry/);
  const events = app.ready();
  events.onError();
  assert.match(app.elements.static.textContent, /choose another/);
  events.onAutoplayBlocked();
  assert.match(app.elements.static.textContent, /press play/);
});

test("fullscreen label follows fullscreenchange including escape", () => {
  const app = setup();
  app.document.fullscreenElement = {};
  app.document.emit("fullscreenchange");
  assert.equal(app.elements.full_screen.textContent, "exit");
  app.document.fullscreenElement = null;
  app.document.emit("fullscreenchange");
  assert.equal(app.elements.full_screen.textContent, "full_screen");
});

test("drawers are mutually exclusive and Escape restores focus to the toggle", () => {
  const app = setup();
  app.open("songs");
  assert.equal(app.elements["songs-panel"].hidden, false);
  assert.equal(
    app.elements["songs-toggle"].attributes["aria-expanded"],
    "true"
  );
  app.open("backgrounds");
  assert.equal(app.elements["songs-panel"].hidden, true);
  assert.equal(app.elements["backgrounds-panel"].hidden, false);
  app.document.emit("keydown", { key: "Escape" });
  assert.equal(app.elements["backgrounds-panel"].hidden, true);
  assert.equal(app.document.activeElement, app.elements["backgrounds-toggle"]);
});

test("clicking outside closes a drawer; clicking inside keeps it open", () => {
  const app = setup();
  app.open("backgrounds");
  app.document.emit("click", { target: app.elements["backgrounds-panel"] });
  assert.equal(app.elements["backgrounds-panel"].hidden, false);
  app.document.emit("click", { target: app.elements.play });
  assert.equal(app.elements["backgrounds-panel"].hidden, true);
});

test("YouTube metadata is fetched only when opened, once, and fills all titles and thumbnails", async () => {
  const app = setup();
  assert.equal(app.requests.length, 0);
  app.open("songs");
  await flush();
  assert.equal(app.requests.length, 19);
  assert.match(app.requests[0], /^https:\/\/www.youtube.com\/oembed\?/);
  assert.equal(app.songs[18].children[1].textContent, "YouTube API title");
  assert.equal(
    app.songs[18].children[0].src,
    "https://i.ytimg.com/api-thumbnail.jpg"
  );
  app.elements["songs-close"].emit("click");
  app.open("songs");
  await flush();
  assert.equal(app.requests.length, 19);
});

test("metadata errors preserve usable song cards and fall back to player titles", async () => {
  const app = setup(async () => {
    throw new Error("Network blocked");
  });
  app.open("songs");
  await flush();
  assert.match(
    app.elements["song-help"].textContent,
    /Some titles unavailable/
  );
  assert.match(app.songs[0].children[1].textContent, /title unavailable/);
  const events = app.ready();
  events.onStateChange({ data: 1, target: app.player });
  assert.equal(app.songs[0].children[1].textContent, "Actual YouTube title");
});

test("background arrows and wheel scroll horizontally", () => {
  const app = setup();
  const list = app.elements["background-list"];
  app.elements["backgrounds-next"].emit("click");
  assert.equal(list.scrollLeft, 400);
  app.elements["backgrounds-previous"].emit("click");
  assert.equal(list.scrollLeft, 0);
  let prevented = false;
  list.emit("wheel", {
    deltaY: 80,
    deltaX: 0,
    deltaMode: 0,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(list.scrollLeft, 80);
  assert.equal(prevented, true);
});

test("UI toggle hides the interface and remains available to restore it", () => {
  const app = setup();
  const toggle = app.elements["ui-toggle"];
  toggle.emit("click");
  assert.equal(app.document.body.classList["ui-hidden"], true);
  assert.equal(toggle.textContent, "show ui");
  assert.equal(toggle.attributes["aria-pressed"], "true");
  toggle.emit("click");
  assert.equal(app.document.body.classList["ui-hidden"], undefined);
  assert.equal(toggle.textContent, "hide ui");
  assert.equal(toggle.attributes["aria-pressed"], "false");
});

test("mouse dragging scrolls the tray without selecting an image", () => {
  const app = setup();
  const list = app.elements["background-list"];
  list.emit("pointerdown", { pointerType: "mouse", button: 0, clientX: 200 });
  list.emit("pointermove", { clientX: 100, pointerId: 1 });
  assert.equal(list.scrollLeft, 100);
  list.emit("pointerup");
  let stopped = false;
  list.emit("click", {
    detail: 1,
    preventDefault() {},
    stopPropagation() {
      stopped = true;
    },
  });
  assert.equal(stopped, true);
});
