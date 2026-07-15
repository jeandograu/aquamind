const todayKey = new Date().toISOString().slice(0, 10);

const levels = [
  { name: "Novato", xp: 0 },
  { name: "Explorador", xp: 250 },
  { name: "Marinheiro", xp: 700 },
  { name: "Golfinho", xp: 1200 },
  { name: "Baleia Azul", xp: 2200 },
  { name: "Mestre da Água", xp: 3600 },
];

const badges = [
  { key: "first", title: "Primeiro copo", detail: "Registrou água hoje", symbol: "1" },
  { key: "week", title: "7 dias seguidos", detail: "Sequência semanal", symbol: "7" },
  { key: "month", title: "30 dias", detail: "Ritual consistente", symbol: "30" },
  { key: "ten", title: "Primeiros 10L", detail: "Volume acumulado", symbol: "10L" },
  { key: "hundred", title: "Primeiros 100L", detail: "Marco histórico", symbol: "100L" },
  { key: "perfect", title: "Meta perfeita", detail: "100% em um dia", symbol: "OK" },
];

const defaultState = {
  goal: 3000,
  current: 1400,
  entries: 4,
  streak: 5,
  bestStreak: 11,
  missedDays: 3,
  xp: 1280,
  totalMl: 126400,
  boosts: {
    workout: false,
    heat: false,
  },
  profile: {
    sex: "feminino",
    weight: 72,
    height: 170,
    age: 29,
    city: "São Paulo",
    climate: "normal",
    exercise: 45,
    wake: "06:30",
    sleep: "23:00",
    coffee: 1,
    alcohol: false,
    fever: false,
    diarrhea: false,
    pregnancy: false,
    altitude: false,
    travel: false,
    medicine: false,
  },
  week: [2600, 3100, 1900, 2800, 3300, 2200, 1400],
  calendar: [
    1, 0.82, 0.42, 0.96, 1.06, 0.73, 0.34,
    0.92, 1, 0.51, 0.88, 0.66, 1.12, 0.79,
    0.47, 0.93, 0.85, 1.02, 0.71, 0.38, 0.46,
  ],
};

let state = loadState();
let toastTimer = null;

const el = {
  dailyBriefTitle: document.querySelector("#dailyBriefTitle"),
  dailyBriefText: document.querySelector("#dailyBriefText"),
  dailyRewardText: document.querySelector("#dailyRewardText"),
  buddy: document.querySelector("#buddy"),
  streakText: document.querySelector("#streakText"),
  xpText: document.querySelector("#xpText"),
  levelShortText: document.querySelector("#levelShortText"),
  levelName: document.querySelector("#levelName"),
  progressRing: document.querySelector("#progressRing"),
  litersText: document.querySelector("#litersText"),
  percentText: document.querySelector("#percentText"),
  remainingText: document.querySelector("#remainingText"),
  paceText: document.querySelector("#paceText"),
  streakRewardText: document.querySelector("#streakRewardText"),
  xpRewardText: document.querySelector("#xpRewardText"),
  petRewardText: document.querySelector("#petRewardText"),
  customAmount: document.querySelector("#customAmount"),
  drinkButton: document.querySelector("#drinkButton"),
  addCustom: document.querySelector("#addCustom"),
  resetDay: document.querySelector("#resetDay"),
  coachMessage: document.querySelector("#coachMessage"),
  coachStatus: document.querySelector("#coachStatus"),
  tankWater: document.querySelector("#tankWater"),
  petFish: document.querySelector("#petFish"),
  petMood: document.querySelector("#petMood"),
  petHint: document.querySelector("#petHint"),
  pathTrack: document.querySelector("#pathTrack"),
  questScore: document.querySelector("#questScore"),
  bodyFill: document.querySelector("#bodyFill"),
  bodyScore: document.querySelector("#bodyScore"),
  bodyMessage: document.querySelector("#bodyMessage"),
  totalLiters: document.querySelector("#totalLiters"),
  averageText: document.querySelector("#averageText"),
  bestStreakText: document.querySelector("#bestStreakText"),
  missedDaysText: document.querySelector("#missedDaysText"),
  weekAverage: document.querySelector("#weekAverage"),
  barChart: document.querySelector("#barChart"),
  calendarGrid: document.querySelector("#calendarGrid"),
  challengeList: document.querySelector("#challengeList"),
  badgeGrid: document.querySelector("#badgeGrid"),
  levelRoad: document.querySelector("#levelRoad"),
  nextLevelText: document.querySelector("#nextLevelText"),
  smartGoalText: document.querySelector("#smartGoalText"),
  profileForm: document.querySelector("#profileForm"),
  sexInput: document.querySelector("#sexInput"),
  weightInput: document.querySelector("#weightInput"),
  heightInput: document.querySelector("#heightInput"),
  ageInput: document.querySelector("#ageInput"),
  cityInput: document.querySelector("#cityInput"),
  climateInput: document.querySelector("#climateInput"),
  exerciseInput: document.querySelector("#exerciseInput"),
  wakeInput: document.querySelector("#wakeInput"),
  sleepInput: document.querySelector("#sleepInput"),
  coffeeInput: document.querySelector("#coffeeInput"),
  alcoholInput: document.querySelector("#alcoholInput"),
  feverInput: document.querySelector("#feverInput"),
  diarrheaInput: document.querySelector("#diarrheaInput"),
  pregnancyInput: document.querySelector("#pregnancyInput"),
  altitudeInput: document.querySelector("#altitudeInput"),
  travelInput: document.querySelector("#travelInput"),
  medicineInput: document.querySelector("#medicineInput"),
  toast: document.querySelector("#toast"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("aquamind-state") || "null");
    if (!saved || saved.date !== todayKey) {
      return { ...defaultState, date: todayKey };
    }
    const merged = {
      ...defaultState,
      ...saved,
      boosts: { ...defaultState.boosts, ...saved.boosts },
      profile: { ...defaultState.profile, ...saved.profile },
    };
    if (merged.profile.city === "Sao Paulo") {
      merged.profile.city = "São Paulo";
    }
    return merged;
  } catch {
    return { ...defaultState, date: todayKey };
  }
}

function saveState() {
  localStorage.setItem("aquamind-state", JSON.stringify(state));
}

function formatMl(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".", ",")}L`;
  }
  return `${Math.round(value)} ml`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function progressRatio() {
  return clamp(state.current / state.goal, 0, 1.25);
}

function currentLevel() {
  return levels.reduce((current, level, index) => {
    if (state.xp >= level.xp) return { ...level, index };
    return current;
  }, { ...levels[0], index: 0 });
}

function nextLevel() {
  const level = currentLevel();
  return levels[level.index + 1] || null;
}

function calculateGoalFromProfile(profile = state.profile) {
  let goal = Number(profile.weight || 70) * 35;
  goal += Number(profile.exercise || 0) * 8;

  if (profile.sex === "masculino") goal += 150;
  if (Number(profile.age || 0) >= 65) goal += 150;
  if (profile.climate === "quente") goal += 400;
  if (profile.climate === "frio") goal -= 180;
  if (profile.climate === "seco") goal += 250;
  goal += Number(profile.coffee || 0) * 90;
  if (profile.alcohol) goal += 350;
  if (profile.fever) goal += 500;
  if (profile.diarrhea) goal += 700;
  if (profile.pregnancy) goal += 300;
  if (profile.altitude) goal += 250;
  if (profile.travel) goal += 180;
  if (profile.medicine) goal += 160;
  if (state.boosts.workout) goal += 350;
  if (state.boosts.heat) goal += 300;

  return Math.round(clamp(goal, 1800, 5200) / 50) * 50;
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2300);
}

function addWater(amount) {
  const before = progressRatio();
  const xpBefore = state.xp;
  state.current = clamp(state.current + amount, 0, Math.round(state.goal * 1.25));
  state.entries += 1;
  state.totalMl += amount;
  state.week[6] = state.current;
  state.calendar[state.calendar.length - 1] = state.current / state.goal;
  state.xp += Math.max(5, Math.round(amount / 40));

  if (before < 1 && progressRatio() >= 1) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    showToast("Meta batida. Sequência protegida e XP extra liberado.");
    state.xp += 80;
  } else {
    showToast(`Registrado: ${formatMl(amount)}. Seu pet agradece.`);
  }

  saveState();
  render();
  pulseFeedback(xpBefore);
}

function pulseFeedback(xpBefore) {
  const gained = state.xp - xpBefore;
  el.progressRing.classList.add("celebrate");
  el.buddy.classList.add("happy");
  el.dailyRewardText.textContent = `+${Math.max(gained, 5)} XP`;
  window.setTimeout(() => {
    el.progressRing.classList.remove("celebrate");
    el.buddy.classList.remove("happy");
  }, 900);
}

function resetDay() {
  state.current = 0;
  state.entries = 0;
  state.week[6] = 0;
  state.calendar[state.calendar.length - 1] = 0;
  saveState();
  showToast("Dia reiniciado para testar o fluxo do app.");
  render();
}

function coachText() {
  const ratio = progressRatio();
  const missing = Math.max(0, state.goal - state.current);
  const cups = Math.max(1, Math.ceil(missing / 250));

  if (ratio >= 1) {
    return "Meta completa. Agora mantenha o ritmo com pequenos goles até dormir.";
  }
  if (state.boosts.workout) {
    return `Treino detectado. A meta subiu e ainda faltam ${formatMl(missing)} para fechar bem a recuperação.`;
  }
  if (state.boosts.heat || state.profile.climate === "quente") {
    return `Dia quente pede reforço. Faltam ${cups} copos para você voltar para a zona verde.`;
  }
  if (ratio < 0.35) {
    return `Você está atrás da meta. Comece com 250 ml agora e deixe o app cuidar do próximo lembrete.`;
  }
  if (ratio < 0.75) {
    return `Bom começo. Faltam apenas ${cups} copos para chegar ao ritmo ideal de hoje.`;
  }
  return `Você está perto. Mais ${formatMl(missing)} e o aquário fica cheio.`;
}

function dailyBriefCopy(ratio, missing) {
  if (ratio >= 1) {
    return [
      "Sequência protegida",
      "Boa. Você completou a missão principal de hoje.",
      "+80 XP",
    ];
  }
  if (ratio >= 0.75) {
    return [
      "Reta final",
      `Faltam ${formatMl(missing)} para deixar o Pingo no modo campeão.`,
      "+50 XP",
    ];
  }
  if (ratio >= 0.35) {
    return [
      "Continue o caminho",
      "Mais alguns copos e você desbloqueia a zona verde.",
      "+35 XP",
    ];
  }
  return [
    "Comece leve",
    "Registre 250 ml agora para acordar o Pingo.",
    "+10 XP",
  ];
}

function petCopy(ratio) {
  if (ratio >= 1) return ["Aquário brilhando", "Seu peixe está no modo campeão."];
  if (ratio >= 0.75) return ["Pet animado", "Falta pouco para deixar tudo azul."];
  if (ratio >= 0.4) return ["Aquário em recuperação", "Mais alguns copos e o pet ganha energia."];
  return ["Pet com sede", "Registre um copo para subir o nível da água."];
}

function getChallenges() {
  const ratio = progressRatio();
  return [
    {
      title: "Primeiro copo",
      detail: "Comece o dia sem pensar demais.",
      reward: "+10 XP",
      value: Math.min(state.current, 250),
      total: 250,
    },
    {
      title: "Três registros",
      detail: "Crie repetição, não heroísmo.",
      reward: "+20 XP",
      value: Math.min(state.entries, 3),
      total: 3,
    },
    {
      title: "Zona verde",
      detail: "Chegue a 90% da meta diária.",
      reward: "+35 XP",
      value: Math.min(ratio, 0.9),
      total: 0.9,
    },
    {
      title: "Meta perfeita",
      detail: "Complete 100% da meta.",
      reward: "+80 XP",
      value: Math.min(ratio, 1),
      total: 1,
    },
  ];
}

function unlockedBadges() {
  const ratio = progressRatio();
  const totalLiters = state.totalMl / 1000;
  return new Set([
    state.current > 0 ? "first" : "",
    state.streak >= 7 ? "week" : "",
    state.streak >= 30 ? "month" : "",
    totalLiters >= 10 ? "ten" : "",
    totalLiters >= 100 ? "hundred" : "",
    ratio >= 1 ? "perfect" : "",
  ].filter(Boolean));
}

function renderHeader() {
  const level = currentLevel();
  const next = nextLevel();
  el.streakText.textContent = `${state.streak}d`;
  el.xpText.textContent = state.xp;
  el.levelShortText.textContent = level.name;
  el.levelName.textContent = `Liga ${level.name}`;
  el.nextLevelText.textContent = next ? `Faltam ${next.xp - state.xp} XP` : "nível máximo";
}

function renderHome() {
  const ratio = progressRatio();
  const percent = Math.round(Math.min(ratio, 1) * 100);
  const missing = Math.max(0, state.goal - state.current);
  const paceCups = Math.ceil(missing / 250);
  el.progressRing.style.setProperty("--progress", `${Math.min(ratio, 1) * 100}%`);
  el.litersText.textContent = `${formatMl(state.current)} / ${formatMl(state.goal)}`;
  el.percentText.textContent = `${percent}%`;
  el.remainingText.textContent = missing > 0 ? `Faltam ${formatMl(missing)}` : "Meta completa";
  el.paceText.textContent = missing > 0 ? `${paceCups} copos restantes` : "ritmo perfeito";
  const [briefTitle, briefText, briefReward] = dailyBriefCopy(ratio, missing);
  el.dailyBriefTitle.textContent = briefTitle;
  el.dailyBriefText.textContent = briefText;
  el.dailyRewardText.textContent = briefReward;
  el.buddy.classList.toggle("sleepy", ratio < 0.35);
  el.coachMessage.textContent = coachText();
  el.coachStatus.textContent = state.boosts.workout || state.boosts.heat ? "adaptado" : "ao vivo";
  el.streakRewardText.textContent = ratio >= 1 ? "Sequência protegida" : "Sequência em jogo";
  el.xpRewardText.textContent = `${Math.max(10, Math.round(state.current / 40))} XP hoje`;
  el.petRewardText.textContent = ratio >= 0.75 ? "Pet animado" : ratio >= 0.35 ? "Pet acordado" : "Pet com sede";

  const waterHeight = clamp(ratio * 100, 12, 100);
  el.tankWater.style.height = `${waterHeight}%`;
  el.petFish.style.top = `${clamp(92 - waterHeight * 0.58, 28, 75)}%`;
  const [mood, hint] = petCopy(ratio);
  el.petMood.textContent = mood;
  el.petHint.textContent = hint;

  const challenges = getChallenges();
  const done = challenges.filter((challenge) => challenge.value >= challenge.total).length;
  el.questScore.textContent = `${done}/${challenges.length} feitas`;
  el.pathTrack.innerHTML = challenges.map((challenge, index) => {
    const complete = challenge.value >= challenge.total;
    const previousDone = index === 0 || challenges[index - 1].value >= challenges[index - 1].total;
    const status = complete ? "done" : previousDone ? "current" : "locked";
    const label = complete ? "OK" : index + 1;
    return `
      <article class="path-node ${status}">
        <div class="path-step">${label}</div>
        <div class="path-copy">
          <strong>${challenge.title}</strong>
          <span>${challenge.detail}</span>
        </div>
        <div class="path-reward">${challenge.reward}</div>
      </article>
    `;
  }).join("");
}

function renderDashboard() {
  const ratio = Math.min(progressRatio(), 1);
  const percent = Math.round(ratio * 100);
  const weekSum = state.week.reduce((sum, value) => sum + value, 0);
  const weekAvg = weekSum / state.week.length;
  el.bodyFill.style.height = `${percent}%`;
  el.bodyScore.textContent = `${percent}%`;
  el.bodyMessage.textContent = percent >= 100
    ? "Seu mapa corporal chegou ao azul completo hoje."
    : "A silhueta fica mais azul conforme você se aproxima da meta.";
  el.totalLiters.textContent = formatMl(state.totalMl).replace(" ml", "ml");
  el.averageText.textContent = formatMl(weekAvg);
  el.bestStreakText.textContent = `${state.bestStreak}d`;
  el.missedDaysText.textContent = state.missedDays;
  el.weekAverage.textContent = `média ${formatMl(weekAvg)}`;

  const labels = ["S", "T", "Q", "Q", "S", "S", "D"];
  el.barChart.innerHTML = state.week.map((value, index) => {
    const barHeight = clamp((value / state.goal) * 100, 8, 100);
    return `
      <div class="bar-item" title="${formatMl(value)}">
        <div class="bar-fill" style="height:${barHeight}%"></div>
        <span>${labels[index]}</span>
      </div>
    `;
  }).join("");

  el.calendarGrid.innerHTML = state.calendar.map((ratioValue, index) => {
    const className = ratioValue >= 0.85 ? "good" : ratioValue >= 0.5 ? "mid" : "bad";
    return `<div class="day-dot ${className}" title="${Math.round(ratioValue * 100)}%">${index + 1}</div>`;
  }).join("");
}

function renderQuests() {
  const challenges = getChallenges();
  el.challengeList.innerHTML = challenges.map((challenge) => {
    const ratio = clamp(challenge.value / challenge.total, 0, 1);
    return `
      <article class="challenge-card">
        <strong>${challenge.title}</strong>
        <p>${challenge.detail}</p>
        <div class="challenge-meter" aria-hidden="true">
          <span style="width:${ratio * 100}%"></span>
        </div>
      </article>
    `;
  }).join("");

  const unlocked = unlockedBadges();
  el.badgeGrid.innerHTML = badges.map((badge) => {
    const isUnlocked = unlocked.has(badge.key);
    return `
      <article class="badge-card ${isUnlocked ? "" : "locked"}">
        <div class="badge-symbol">${isUnlocked ? badge.symbol : "--"}</div>
        <strong>${badge.title}</strong>
        <span>${badge.detail}</span>
      </article>
    `;
  }).join("");

  const active = currentLevel();
  el.levelRoad.innerHTML = levels.map((level, index) => {
    const status = index === active.index ? "active" : state.xp < level.xp ? "locked" : "";
    const marker = state.xp >= level.xp ? "OK" : level.xp;
    return `
      <article class="level-card ${status}">
        <div class="level-icon">${index + 1}</div>
        <div>
          <strong>${level.name}</strong>
          <span>${level.xp} XP necessários</span>
        </div>
        <strong>${marker}</strong>
      </article>
    `;
  }).join("");
}

function fillProfileForm() {
  const profile = state.profile;
  el.sexInput.value = profile.sex;
  el.weightInput.value = profile.weight;
  el.heightInput.value = profile.height;
  el.ageInput.value = profile.age;
  el.cityInput.value = profile.city;
  el.climateInput.value = profile.climate;
  el.exerciseInput.value = profile.exercise;
  el.wakeInput.value = profile.wake;
  el.sleepInput.value = profile.sleep;
  el.coffeeInput.value = profile.coffee;
  el.alcoholInput.checked = profile.alcohol;
  el.feverInput.checked = profile.fever;
  el.diarrheaInput.checked = profile.diarrhea;
  el.pregnancyInput.checked = profile.pregnancy;
  el.altitudeInput.checked = profile.altitude;
  el.travelInput.checked = profile.travel;
  el.medicineInput.checked = profile.medicine;
  el.smartGoalText.textContent = formatMl(state.goal);
}

function readProfileForm() {
  return {
    sex: el.sexInput.value,
    weight: Number(el.weightInput.value),
    height: Number(el.heightInput.value),
    age: Number(el.ageInput.value),
    city: el.cityInput.value.trim() || "Minha cidade",
    climate: el.climateInput.value,
    exercise: Number(el.exerciseInput.value),
    wake: el.wakeInput.value,
    sleep: el.sleepInput.value,
    coffee: Number(el.coffeeInput.value),
    alcohol: el.alcoholInput.checked,
    fever: el.feverInput.checked,
    diarrhea: el.diarrheaInput.checked,
    pregnancy: el.pregnancyInput.checked,
    altitude: el.altitudeInput.checked,
    travel: el.travelInput.checked,
    medicine: el.medicineInput.checked,
  };
}

function render() {
  state.goal = calculateGoalFromProfile();
  renderHeader();
  renderHome();
  renderDashboard();
  renderQuests();
  el.smartGoalText.textContent = formatMl(state.goal);
  saveState();
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => addWater(Number(button.dataset.add)));
});

el.drinkButton.addEventListener("click", () => addWater(250));

el.addCustom.addEventListener("click", () => {
  const amount = clamp(Number(el.customAmount.value || 0), 50, 2000);
  addWater(amount);
});

el.resetDay.addEventListener("click", resetDay);

document.querySelectorAll("[data-boost]").forEach((button) => {
  button.addEventListener("click", () => {
    const boost = button.dataset.boost;
    if (boost === "coffee") {
      state.profile.coffee += 1;
      el.coffeeInput.value = state.profile.coffee;
      showToast("Café registrado. A IA ajustou sua meta de hoje.");
    } else {
      state.boosts[boost] = !state.boosts[boost];
      showToast(state.boosts[boost] ? "Contexto ativado. Meta adaptada." : "Contexto removido.");
    }
    render();
  });
});

document.querySelectorAll(".bottom-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".bottom-nav button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("active");
  });
});

el.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = readProfileForm();
  state.goal = calculateGoalFromProfile(state.profile);
  state.week[6] = state.current;
  state.calendar[state.calendar.length - 1] = state.current / state.goal;
  saveState();
  showToast(`Nova meta inteligente: ${formatMl(state.goal)}.`);
  render();
});

fillProfileForm();
render();
