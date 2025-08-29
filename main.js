const store = {
  get(k, f) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

const $ = (s, r = document) => r.querySelector(s);

function updateNet() {
  const d = $("#netDot");
  if (!d) return;
  d.textContent = "●";
  d.className = navigator.onLine ? "ok" : "warn";
}

addEventListener("online", updateNet);
addEventListener("offline", updateNet);
updateNet();

const defaultLinks = [
  { label: "地図（デモ）", view: "map" },
  { label: "よくある質問", view: "faq" },
  { label: "メモ", view: "notes" },
];

function renderLinks() {
  const links = store.get("links", defaultLinks);
  const ul = $("#quickLinks");
  if (!ul) return;
  ul.innerHTML = "";

  for (const { label, view } of links) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "link";
    a.href = "#";
    a.dataset.open = view;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  }
}
renderLinks();

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-open]");
  if (!a) return;
  e.preventDefault();
  openView(a.dataset.open);
});

const views = {
  home() {
    return card("ようこそ", "ここに機能カードを追加していきます。");
  },
  map() {
    return card("地図（デモ）", "本番では地図SDKや静的マップ画像をキャッシュして表示。");
  },
  faq() {
    return card("よくある質問", "後で定型文を入れられるようにします。");
  },
  notes() {
    const w = document.createElement("div");
    const t = document.createElement("textarea");
    t.style.width = "100%";
    t.style.height = "40vh";
    t.placeholder = "ここにメモ（端末内に保存）";
    t.value = store.get("notes", "");
    t.addEventListener("input", () => store.set("notes", t.value));
    w.appendChild(t);
    return w;
  },
};

function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  d.append(h, p);
  return d;
}

function openView(name) {
  const v = $("#view");
  const t = $("#viewTitle");
  if (!v || !t) return;
  t.textContent = name.toUpperCase();
  v.innerHTML = "";
  const fn = views[name] || views.home;
  v.appendChild(fn());
}

addEventListener("keydown", (e) => {
  if (e.key === "/" || e.key.toLowerCase() === "q") {
    e.preventDefault();
    const q = $("#q");
    if (q) q.focus();
  }
});

openView("home");

// A2HS（ホーム追加）UI
let deferredPrompt;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("installBtn");
  if (!b) return;
  b.hidden = false;
  b.addEventListener("click", async () => {
    b.hidden = true;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
});
