/**
 * Birthday Surprise — Cinematic Interactive Story
 */



const WISH_WAIT_MS = 6500;
const BLOW_DURATION_MS = 2000;
const TRANSITION_MS = 1000;

const QUIZ_QUESTIONS = [];

let cakeSequenceStarted = false;
let letterSequenceStarted = false;
let dodgeCount = 0;

const heartsContainer = document.querySelector(".hearts-bg");
const confettiEl = document.getElementById("confetti-canvas");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let audioCtx;

function playClickSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (_) {}
}

function playBlowSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.25, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.05;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (_) {}
}

function bindSoundButtons() {
  document.querySelectorAll("[data-sound='click']").forEach((btn) => {
    btn.addEventListener("click", () => playClickSound());
  });
}

function transitionTo(nextId, onMid, { zoom = false } = {}) {
  const current = document.querySelector(".page.active");
  if (current) {
    current.classList.add("leaving");
    if (zoom) current.classList.add("leaving--zoom");
  }
  setTimeout(() => {
    if (onMid) onMid();
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.remove("active", "leaving", "leaving--zoom", "active--zoom");
      if (p.id === nextId) {
        p.classList.add("active");
        if (zoom) p.classList.add("active--zoom");
      }
    });
    window.scrollTo(0, 0);
  }, TRANSITION_MS);
}

function goToPage(id, opts) {
  transitionTo(id, null, opts);
}

// Hearts
function spawnHeart() {
  const el = document.createElement("span");
  el.className = "heart-float";
  el.textContent = ["❤️", "💕", "💖", "💗"][Math.floor(Math.random() * 4)];
  el.style.left = `${Math.random() * 100}%`;
  el.style.animationDuration = `${7 + Math.random() * 5}s`;
  heartsContainer.appendChild(el);
  setTimeout(() => el.remove(), 12000);
}
setInterval(spawnHeart, 1000);

function fireConfetti() {
  const colors = ["#f8b4d9", "#e879a9", "#fbbf24", "#c4b5fd", "#fff5f7"];
  const pieces = [];
  for (let i = 0; i < 55; i++) {
    const piece = document.createElement("div");
    piece.style.cssText = `position:fixed;width:${5 + Math.random() * 5}px;height:${6 + Math.random() * 6}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-10px;border-radius:50%;pointer-events:none;z-index:200;opacity:0.9;`;
    confettiEl.appendChild(piece);
    pieces.push({ el: piece, x: parseFloat(piece.style.left), vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8 });
  }
  let frame = 0;
  (function animate() {
    frame++;
    pieces.forEach((p) => {
      p.vy += 0.07;
      p.x += p.vx;
      p.rot += p.vr;
      p.el.style.left = `${p.x}%`;
      p.el.style.top = `${-10 + p.vy * frame * 0.5}px`;
      p.el.style.transform = `rotate(${p.rot}deg)`;
    });
    if (frame < 110) requestAnimationFrame(animate);
    else pieces.forEach((p) => p.el.remove());
  })();
}

// Music
let musicWanted = false;
musicToggle.addEventListener("click", async () => {
  playClickSound();
  musicWanted = !musicWanted;
  musicToggle.classList.toggle("muted", !musicWanted);
  if (musicWanted) {
    try {
      bgMusic.volume = 0.28;
      await bgMusic.play();
    } catch {
      musicToggle.title = "Add romantic.mp3 to enable music";
    }
  } else bgMusic.pause();
});

// —— 1. Cake ——
function spawnSparkles(container) {
  container.innerHTML = "";
  for (let i = 0; i < 32; i++) {
    const dot = document.createElement("span");
    dot.className = "sparkle-dot";
    dot.style.left = `${35 + Math.random() * 30}%`;
    dot.style.top = `${25 + Math.random() * 35}%`;
    dot.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(dot);
  }
  container.classList.add("active");
  setTimeout(() => container.classList.remove("active"), 1600);
}

function blowOutCandle() {
  const flame = document.getElementById("candleFlame");
  const wind = document.getElementById("blowWind");
  const wishText = document.getElementById("cakeWishText");
  const stage = document.getElementById("cakeStage");
  const burst = document.getElementById("cakeSparkleBurst");

  wishText.textContent = "Your wish is on its way… ✨";
  wind.classList.add("active");
  playBlowSound();
  flame.classList.add("blown-out");

  setTimeout(() => {
    spawnSparkles(burst);
    stage.classList.add("wish-done");
    wishText.classList.add("fade-out");
  }, 400);

  setTimeout(() => {
    transitionTo("letter", () => startLetterCinematic(), { zoom: true });
  }, BLOW_DURATION_MS);
}

function startCakeSequence() {
  if (cakeSequenceStarted) return;
  cakeSequenceStarted = true;
  setTimeout(blowOutCandle, WISH_WAIT_MS);
}

// —— 2. Letter cinematic ——
function resetLetterCinematic() {
  letterSequenceStarted = false;
  const wrap = document.getElementById("envelopeWrap");
  const focus = document.getElementById("letterFocus");
  const vignette = document.getElementById("letterVignette");

  wrap.className = "envelope-float-wrap";
  focus.classList.add("hidden");
  focus.classList.remove("visible");
  vignette.classList.remove("active");
}

function startLetterCinematic() {
  if (letterSequenceStarted) return;
  letterSequenceStarted = true;

  const wrap = document.getElementById("envelopeWrap");
  const focus = document.getElementById("letterFocus");
  const vignette = document.getElementById("letterVignette");

  wrap.classList.add("phase-rise");

  setTimeout(() => {
    wrap.classList.add("phase-open");
  }, 2800);

  setTimeout(() => {
    wrap.classList.add("phase-vanish");
  }, 4200);

  setTimeout(() => {
    wrap.style.visibility = "hidden";
    vignette.classList.add("active");
    focus.classList.remove("hidden");
    focus.classList.add("visible");
  }, 5200);
}

// —— 3. Slow playful dodge ——
function getDodgeChance() {
  if (dodgeCount >= 20) return 0.15;
  if (dodgeCount >= 14) return 0.4;
  if (dodgeCount >= 8) return 0.6;
  return 0.75;
}

function dodgeNoButton() {
  if (Math.random() > getDodgeChance()) return;

  const btnNo = document.getElementById("btnNo");
  const arena = document.getElementById("singleArena");
  const tease = document.getElementById("singleTease");
  const hint = document.getElementById("singleHint");

  dodgeCount++;
  const pad = 12;
  const ar = arena.getBoundingClientRect();
  const br = btnNo.getBoundingClientRect();
  const maxL = ar.width - br.width - pad;
  const maxT = ar.height - br.height - pad;

  const currentLeft = parseFloat(btnNo.style.left) || ar.width * 0.55;
  let newLeft = pad + Math.random() * Math.max(0, maxL);
  let newTop = pad + Math.random() * Math.max(0, maxT);

  if (Math.abs(newLeft - currentLeft) < 50) {
    newLeft = newLeft < ar.width / 2 ? maxL * 0.7 : pad;
  }

  btnNo.style.left = `${newLeft}px`;
  btnNo.style.top = `${newTop}px`;
  btnNo.style.right = "auto";
  btnNo.style.bottom = "auto";

  const teases = ["Nice try 😂", "So close…", "Yes is right there 😏", "Almost!", "You're cute when you try 💕"];
  tease.textContent = teases[Math.min(dodgeCount - 1, teases.length - 1)];
  tease.classList.remove("hidden");
  if (dodgeCount > 12) hint.textContent = "Okay… Yes is waiting for you 😉";
}

function resetSingleButtons() {
  dodgeCount = 0;
  const btnNo = document.getElementById("btnNo");
  btnNo.style.left = "";
  btnNo.style.top = "";
  btnNo.style.right = "18%";
  btnNo.style.bottom = "24px";
  document.getElementById("singleTease").classList.add("hidden");
  document.getElementById("singleHint").textContent = "Be honest… 😏";
}

function setupDodgingNo() {
  const btnNo = document.getElementById("btnNo");
  const arena = document.getElementById("singleArena");
  let lastDodge = 0;

  function tryDodge() {
    const now = Date.now();
    if (now - lastDodge < 450) return;
    lastDodge = now;
    dodgeNoButton();
  }

  arena.addEventListener("mousemove", (e) => {
    const r = btnNo.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 95) tryDodge();
  });

  btnNo.addEventListener("touchstart", (e) => {
    if (getDodgeChance() > 0 && dodgeCount < 22) {
      e.preventDefault();
      tryDodge();
    }
  }, { passive: false });

  btnNo.addEventListener("click", (e) => {
    if (getDodgeChance() > 0.2 && dodgeCount < 24) {
      e.preventDefault();
      tryDodge();
      document.getElementById("singleTease").textContent = "I don't believe you! 😂 Tap Yes!";
    }
  });
}

// —— 4. Final romance cinematic sequence ——
const CINEMA_LINES = [
  { text: "I'm single… you're single…", hold: 2600, enter: "normal", leave: 800 },
  { text: "Do you know what that means?", hold: 3200, enter: "slow", leave: 900 },
  { text: "Nobody wants us…", hold: 3200, enter: "slow", leave: 900 },
  { text: "Why don't we become somebody to each other?", hold: 3800, enter: "emphasis", leave: 1000 },
];

const CINEMA_PAUSE_MS = 1600;

let cinemaTimeouts = [];
let floatParticleInterval = null;

function clearCinemaTimeouts() {
  cinemaTimeouts.forEach(clearTimeout);
  cinemaTimeouts = [];
}

function wait(ms) {
  return new Promise((resolve) => {
    cinemaTimeouts.push(setTimeout(resolve, ms));
  });
}

function setCinemaText(text, enterMode) {
  const el = document.getElementById("cinemaText");
  el.className = "cinema-text";
  el.textContent = text;
  if (enterMode === "slow") el.classList.add("is-entering", "is-entering--slow");
  else if (enterMode === "emphasis") el.classList.add("is-emphasis", "is-entering");
  else el.classList.add("is-entering");
}

async function fadeOutCinemaText(leaveMs) {
  const el = document.getElementById("cinemaText");
  el.classList.remove("is-entering", "is-entering--slow");
  el.classList.add("is-leaving");
  await wait(leaveMs);
  el.className = "cinema-text";
  el.textContent = "";
}

async function runCinemaSequence() {
  clearCinemaTimeouts();
  document.getElementById("cinemaStage").classList.remove("hidden");
  document.getElementById("romanceProposal").classList.add("hidden");
  document.getElementById("romanceCelebration").classList.add("hidden");
  document.getElementById("romanceScreenGlow").classList.remove("active");

  for (const line of CINEMA_LINES) {
    setCinemaText(line.text, line.enter);
    await wait(line.enter === "slow" ? 1500 : line.enter === "emphasis" ? 1400 : 1000);
    await wait(line.hold);
    await fadeOutCinemaText(line.leave);
    await wait(350);
  }

  document.getElementById("cinemaText").textContent = "";
  await wait(CINEMA_PAUSE_MS);
  showProposal();
}

function showProposal() {
  yesCelebrationStarted = false;
  document.getElementById("cinemaStage").classList.add("hidden");
  document.getElementById("romanceProposal").classList.remove("hidden");
  document.getElementById("noReactionPanel").classList.remove("visible");
  document.getElementById("noReactionPanel").classList.add("hidden");
  document.getElementById("proposalYes").disabled = false;
  document.getElementById("proposalNo").disabled = false;
  document.getElementById("proposalTease").classList.add("hidden");
}

/** Hidden email to you — she never sees this. Requires config.js access key + local server. */
function isEmailConfigured() {
  const key = window.BIRTHDAY_EMAIL_CONFIG?.accessKey?.trim();
  return key && key !== "PASTE_YOUR_KEY_HERE";
}

async function sendSecretEmail(message, subject) {
  const cfg = window.BIRTHDAY_EMAIL_CONFIG;
  if (!isEmailConfigured()) {
    console.warn(
      "[Birthday] Email not sent — add your Web3Forms access key in config.js (see SETUP-EMAIL.md)"
    );
    return false;
  }

  const payload = JSON.stringify({
    access_key: cfg.accessKey.trim(),
    subject: subject,
    message: message,
    from_name: "Birthday Surprise",
    botcheck: false,
  });

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: payload,
      keepalive: true,
    });
    const data = await res.json();
    if (!data.success) {
      console.warn("[Birthday] Email API error:", data.message || data);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      "[Birthday] Email failed (use http://localhost — not file://). Error:",
      err
    );
    return false;
  }
}

function checkEmailSetup() {
  if (!isEmailConfigured()) {
    console.info(
      "%c[Birthday] To receive Yes/No emails: paste Web3Forms key in config.js → run: npx serve .",
      "color:#f472b6;font-weight:bold;"
    );
  }
}

const FLOAT_ICONS = ["❤️", "💕", "💖", "💗", "🩷", "🌸", "🌺", "🌷", "🌹", "💐", "🌼", "🌻", "🥀"];

function spawnFloatParticle() {
  const layer = document.getElementById("floatCelebration");
  const el = document.createElement("span");
  el.className = "float-particle";
  el.textContent = FLOAT_ICONS[Math.floor(Math.random() * FLOAT_ICONS.length)];
  el.style.left = `${Math.random() * 100}%`;
  el.style.fontSize = `${1.1 + Math.random() * 1.4}rem`;
  const dur = 4 + Math.random() * 5;
  el.style.animationDuration = `${dur}s`;
  el.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 120}px`);
  el.style.setProperty("--drift-r", `${(Math.random() - 0.5) * 360}deg`);
  layer.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 200);
}

function startFloatingCelebration() {
  const layer = document.getElementById("floatCelebration");
  layer.innerHTML = "";
  for (let i = 0; i < 25; i++) setTimeout(spawnFloatParticle, i * 120);
  if (floatParticleInterval) clearInterval(floatParticleInterval);
  floatParticleInterval = setInterval(spawnFloatParticle, 280);
}

function stopFloatingCelebration() {
  if (floatParticleInterval) {
    clearInterval(floatParticleInterval);
    floatParticleInterval = null;
  }
}

let yesCelebrationStarted = false;

async function celebrateYes() {
  if (yesCelebrationStarted) return;
  yesCelebrationStarted = true;

  document.getElementById("proposalYes").disabled = true;
  document.getElementById("proposalNo").disabled = true;

  const emailPromise = sendSecretEmail("yes i want to be yours", "She said YES");

  document.getElementById("romanceProposal").classList.add("hidden");
  document.getElementById("romanceScreenGlow").classList.add("active");

  if (!musicWanted) {
    musicWanted = true;
    musicToggle.classList.remove("muted");
    try {
      bgMusic.volume = 0.35;
      await bgMusic.play();
    } catch (_) {}
  }

  startFloatingCelebration();
  for (let i = 0; i < 6; i++) {
    setTimeout(() => fireConfetti(), i * 350);
    setTimeout(spawnHeart, i * 250);
  }

  document.getElementById("romanceCelebration").classList.remove("hidden");
  await emailPromise;
}

async function handleProposalNo() {
  playClickSound();
  await sendSecretEmail("no your not my type", "She pressed NO");

  document.getElementById("proposalYes").disabled = true;
  document.getElementById("proposalNo").disabled = true;
  document.getElementById("romanceProposal").classList.add("hidden");
  document.getElementById("proposalTease").classList.add("hidden");

  const panel = document.getElementById("noReactionPanel");
  const img = document.getElementById("noReactionImg");
  const fallback = document.getElementById("noReactionFallback");

  panel.classList.remove("hidden");
  requestAnimationFrame(() => panel.classList.add("visible"));

  img.onload = () => {
    img.style.display = "block";
    fallback.classList.add("hidden");
  };
  img.onerror = () => {
    img.style.display = "none";
    fallback.classList.remove("hidden");
  };
  if (img.complete && img.naturalWidth > 0) img.onload();
  else if (img.complete) img.onerror();
}

function startRomanceStory() {
  resetRomance();
  runCinemaSequence();
}

function resetRomance() {
  yesCelebrationStarted = false;
  clearCinemaTimeouts();
  stopFloatingCelebration();
  document.getElementById("floatCelebration").innerHTML = "";
  document.getElementById("cinemaStage").classList.remove("hidden");
  document.getElementById("cinemaText").className = "cinema-text";
  document.getElementById("cinemaText").textContent = "";
  document.getElementById("romanceProposal").classList.add("hidden");
  document.getElementById("romanceCelebration").classList.add("hidden");
  document.getElementById("romanceScreenGlow").classList.remove("active");
  const noPanel = document.getElementById("noReactionPanel");
  noPanel.classList.add("hidden");
  noPanel.classList.remove("visible");
  document.getElementById("noReactionImg").style.display = "";
  document.getElementById("noReactionFallback").classList.add("hidden");
  document.getElementById("proposalYes").disabled = false;
  document.getElementById("proposalNo").disabled = false;
}

// Quiz
let quizStep = 0;

function renderQuiz() {
  quizStep = 0;
  document.getElementById("quizNext").classList.add("hidden");
  showQuizStep();
}

function showQuizStep() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";
  if (quizStep >= QUIZ_QUESTIONS.length) return;

  const q = QUIZ_QUESTIONS[quizStep];
  const card = document.createElement("div");
  card.className = "quiz-card";

  const progress = document.createElement("p");
  progress.className = "quiz-progress";
  progress.textContent = `Question ${quizStep + 1} of ${QUIZ_QUESTIONS.length}`;

  const question = document.createElement("h3");
  question.className = "quiz-question";
  question.textContent = q.question;

  const options = document.createElement("div");
  options.className = "quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (card.classList.contains("answered")) return;
      playClickSound();
      card.classList.add("answered");
      btn.classList.add(i === q.correct ? "selected-correct" : "selected-wrong");
      feedback.textContent = i === q.correct ? q.feedbackCorrect : q.feedbackWrong;
      options.querySelectorAll("button").forEach((b) => (b.disabled = true));
      setTimeout(() => {
        quizStep++;
        if (quizStep < QUIZ_QUESTIONS.length) showQuizStep();
        else document.getElementById("quizNext").classList.remove("hidden");
      }, 1400);
    });
    options.appendChild(btn);
  });

  card.append(progress, question, options, feedback);
  container.appendChild(card);
}

// Navigation
document.getElementById("letterNext").addEventListener("click", () => goToPage("single"));

document.getElementById("btnYes").addEventListener("click", () => {
  playClickSound();
  transitionTo("romance", () => startRomanceStory());
});

const proposalYesBtn = document.getElementById("proposalYes");
const proposalNoBtn = document.getElementById("proposalNo");

proposalYesBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  playClickSound();
  celebrateYes().catch((err) => console.warn("[Birthday] celebrateYes error:", err));
});

proposalNoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  handleProposalNo().catch((err) => console.warn("[Birthday] handleProposalNo error:", err));
});

document.getElementById("celebrationContinue").addEventListener("click", () => {
  playClickSound();
  stopFloatingCelebration();
  goToPage("final");
});

// The quiz is not part of the post-yes celebration flow.
document.getElementById("quizNext").addEventListener("click", () => goToPage("memories"));
document.getElementById("memoriesNext").addEventListener("click", () => goToPage("final"));

document.getElementById("replayBtn").addEventListener("click", () => {
  cakeSequenceStarted = false;
  resetLetterCinematic();
  resetSingleButtons();
  resetRomance();
  renderQuiz();

  const wrap = document.getElementById("envelopeWrap");
  wrap.style.visibility = "";

  document.getElementById("candleFlame").classList.remove("blown-out");
  document.getElementById("blowWind").classList.remove("active");
  const wishText = document.getElementById("cakeWishText");
  wishText.textContent = "Close your eyes and make a wish…";
  wishText.classList.remove("fade-out");
  document.getElementById("cakeStage").classList.remove("wish-done");
  document.getElementById("cakeSparkleBurst").innerHTML = "";

  transitionTo("cake", () => startCakeSequence(), { zoom: true });
});

/** Preview a scene: index.html?page=single (also: letter, reveal, quiz, memories, final) */
function openPreviewPage() {
  const page = new URLSearchParams(location.search).get("page");
  if (!page) return;
  const valid = ["cake", "letter", "single", "romance", "quiz", "memories", "final"];
  if (page === "romance") startRomanceStory();
  if (!valid.includes(page)) return;
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active", "leaving", "leaving--zoom", "active--zoom");
    p.classList.toggle("active", p.id === page);
  });
  if (page !== "cake") cakeSequenceStarted = true;
  if (page === "letter") {
    letterSequenceStarted = true;
    const wrap = document.getElementById("envelopeWrap");
    wrap.style.visibility = "hidden";
    document.getElementById("letterVignette").classList.add("active");
    const focus = document.getElementById("letterFocus");
    focus.classList.remove("hidden");
    focus.classList.add("visible");
  }
}

bindSoundButtons();
checkEmailSetup();
setupDodgingNo();
renderQuiz();
openPreviewPage();
if (!new URLSearchParams(location.search).get("page")) startCakeSequence();

document.body.addEventListener("click", () => {
  if (audioCtx?.state === "suspended") audioCtx.resume();
}, { once: true });
