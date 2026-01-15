// --- Кнопка для обновления ---
const update_app = document.getElementById('update_app');
update_app.style.display = 'none'; // скрыта по умолчанию

// --- Service Worker регистрация ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    // Слушаем появление новой версии SW
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Новый контент доступен
          update_app.style.display = 'flex';
        }
      };
    };
  }).catch(console.error);
}

// При клике на кнопку обновления
update_app.onclick = () => {
  window.location.reload(); // перезагрузка страницы и активация нового SW
  speak("Приложение обновлено");
};

// --- Тут твой код управления ESP ---

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxURZ9fmgYutfPyvVBnZsiiH3bKHVRnM8",
  authDomain: "cabinecontrol.firebaseapp.com",
  databaseURL: "https://cabinecontrol-default-rtdb.firebaseio.com",
  projectId: "cabinecontrol",
  storageBucket: "cabinecontrol.firebasestorage.app",
  messagingSenderId: "609921132274",
  appId: "1:609921132274:web:ffaeb35d7607c97cd6926b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var workLeds = "8";
let utterance = null;
var sound_voice = true;

let firstLoadDone = false;

//SideNAv
const container = document.getElementById('container');
container.addEventListener("click", () => {
  closeNav();
})
function openNav() {
  document.getElementById("mySidenav")
    .style.width = "250px";
  document.getElementById('set_leds').value = `${workLeds}`;
}
function closeNav() {
  document.getElementById("mySidenav")
    .style.width = "0";
}

//Установка количества светодиодов
$("#save_but_led").click(function () {
  const set_value = document.getElementById("set_leds").value;
  let firebaseRef = firebase.database().ref().child("LedCount");
  firebaseRef.set(set_value)
    .then(() => {
      showInfoMessage("Настройки сохранены успешно");
      if (sound_voice == true) {
        const texton = "Количество светодиодов сохранено";
        speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(texton);
        speechSynthesis.speak(utterance);
      }
    })
    .catch((error) => {
      showInfoMessage("Ошибка при сохранении" + error, true);
    });
  function showInfoMessage(message, isError = false) {
    const infoContainer = document.getElementById("infoContainer");
    infoContainer.innerHTML = message;

    if (isError) {
      infoContainer.style.backgroundColor = "red";
    } else {
      infoContainer.style.backgroundColor = "#4CAF50";
    }
    infoContainer.style.display = "block";

    setTimeout(() => {
      infoContainer.style.display = "none";
    }, 3000); // Скрыть информер через 3 секунды
  }
})

// Работа с температурой и влажностью + сигнал wifi + светодиоды
let datacheck = firebase.database();
let cabine_temp;
let cabine_hum;
let wifi_sig;
datacheck.ref().on("value", function (snap) {
  cabine_temp = snap.val().Cabine_tempC;
  cabine_hum = snap.val().Cabine_humH;
  wifi_sig = snap.val().WifiCabine;
  workLeds = snap.val().LedCount;
  document.getElementById("local_temp").innerHTML = `${cabine_temp}`;
  document.getElementById("local_hum").innerHTML = `${cabine_hum}`;
  document.getElementById("signal").innerHTML = `${wifi_sig}`;

  // for Loader
  if (!firstLoadDone) {
    firstLoadDone = true;
    showLoader(false);
  }

});

// Loader animation 
function showLoader(state) {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  if (state) {
    loader.style.display = "flex";
    content.style.display = "none";
    content.style.opacity = 0;
  } else {
    loader.style.display = "none";
    content.style.display = "block";

    requestAnimationFrame(() => {
      content.style.opacity = 1;
    });
  }
}

// Работа со слайдером
var sliderRed = document.getElementById("sliderRed");
var sliderGreen = document.getElementById("sliderGreen");
var sliderBlue = document.getElementById("sliderBlue");
var sliderBright = document.getElementById("sliderBright");

var SelectValueRed = document.getElementById("SelectValueRed"); /* create variable*/
var SelectValueGreen = document.getElementById("SelectValueGreen"); /* create variable*/
var SelectValueBlue = document.getElementById("SelectValueBlue"); /* create variable*/
var SelectValueBright = document.getElementById("SelectValueBright"); /* create variable*/

let slidercheck = firebase.database();
let firebaseRed;
let firebaseGreen;
let firebaseBlue;
let firebaseBright;
slidercheck.ref().on("value", function (snap) {
  firebaseRed = snap.val().SliderRed;
  firebaseGreen = snap.val().SliderGreen;
  firebaseBlue = snap.val().SliderBlue;
  firebaseBright = snap.val().SliderBright;
  document.getElementById('cur_color').style.backgroundColor = `rgb(${firebaseRed}, ${firebaseGreen}, ${firebaseBlue})`;
  SelectValueRed.innerHTML = firebaseRed;
  SelectValueGreen.innerHTML = firebaseGreen;
  SelectValueBlue.innerHTML = firebaseBlue;
  SelectValueBright.innerHTML = firebaseBright;
  sliderRed.value = firebaseRed;
  sliderGreen.value = firebaseGreen;
  sliderBlue.value = firebaseBlue;
  sliderBright.value = firebaseBright;
});

sliderRed.oninput = function () {
  SelectValueRed.innerHTML = this.value; /* able to change the value*/
  let firebaseRed = firebase.database().ref().child("SliderRed");
  firebaseRed.set(sliderRed.value);
}
sliderGreen.oninput = function () {
  SelectValueGreen.innerHTML = this.value; /* able to change the value*/
  let firebaseGreen = firebase.database().ref().child("SliderGreen");
  firebaseGreen.set(sliderGreen.value);
}
sliderBlue.oninput = function () {
  SelectValueBlue.innerHTML = this.value; /* able to change the value*/
  let firebaseBlue = firebase.database().ref().child("SliderBlue");
  firebaseBlue.set(sliderBlue.value);
}
sliderBright.oninput = function () {
  SelectValueBright.innerHTML = this.value; /* able to change the value*/
  let firebaseBright = firebase.database().ref().child("SliderBright");
  firebaseBright.set(sliderBright.value);
}

//Режим работы цвета
let modecheck = firebase.database();
let Automodenow;
modecheck.ref().on("value", function (snap) {
  Automodenow = snap.val().Automode;
  if (Automodenow == 1) {
    document.getElementById('automode').checked = 1;
    document.getElementById('set_color_name').innerText = "РЕЖИМ-РАДУГА";
    document.getElementById("sliderRed").classList.remove('slider');
    document.getElementById("sliderGreen").classList.remove('slider');
    document.getElementById("sliderBlue").classList.remove('slider');
    document.getElementById("sliderRed").classList.add('sliderNocolor');
    document.getElementById("sliderGreen").classList.add('sliderNocolor');
    document.getElementById("sliderBlue").classList.add('sliderNocolor');
  } else {
    document.getElementById('automode').checked = 0;
    document.getElementById('set_color_name').innerText = "РУЧ-РЕЖИМ";
    document.getElementById("sliderRed").classList.remove('sliderNocolor');
    document.getElementById("sliderGreen").classList.remove('sliderNocolor');
    document.getElementById("sliderBlue").classList.remove('sliderNocolor');
    document.getElementById("sliderRed").classList.add('slider');
    document.getElementById("sliderGreen").classList.add('slider');
    document.getElementById("sliderBlue").classList.add('slider');
  }
});
$("#automode").click(function () {
  let firebaseMode = firebase.database().ref().child("Automode");
  if (Automodenow == 1) {
    firebaseMode.set(0);
    const modeoff = "Автоматический режим, выключен";
    responsiveVoice.speak(modeoff, "Russian Female");
  } else {
    firebaseMode.set(1);
    const modeon = "Автоматический режим, включен";
    responsiveVoice.speak(modeon, "Russian Female");
  }
})


//Engine Knob
const button = document.querySelector('.engine');
const light = document.querySelector('.light');
let powercheck = firebase.database();
let firebasePower;
let state;

powercheck.ref().on("value", function (snap) {
  firebasePower = parseInt(snap.val().PowerInfo);
  if (firebasePower === 1) {
    button.classList.add("active");
    state = 1;
  } else {
    button.classList.remove("active");
    state = 0;
  }
});

button.addEventListener('click', (e) => {
  let power = firebase.database().ref().child("Power");
  if (state === 0) {
    power.set(1);
  } else if (state === 1) {
    power.set(0);
  }
});

//Статус подключения к интернету
var units_status = firebase.database();
var stat_wifi;
var prev_statwifi;
units_status.ref().on("value", function (snap) {
  stat_wifi = snap.val().StatusCabine;
});

function status_device() {
  let wifi_indicator = document.getElementById('status_wifi');

  if (stat_wifi == prev_statwifi) {
    wifi_indicator.classList.remove('wifi_on');
    wifi_indicator.classList.add('wifi_off');
    prev_statwifi = stat_wifi;
  } else {
    wifi_indicator.classList.remove('wifi_off');
    wifi_indicator.classList.add('wifi_on');
    prev_statwifi = stat_wifi;
  }
}
setInterval(status_device, 6000);

//  Animation BG
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 20;
const maxDistance = 120;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.radius = 4;
    this.points = 8; // Количество концов у звезды
    this.innerRadius = this.radius / 2; // Внутренний радиус звезды
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  draw() {
    this.drawStar(this.x, this.y, this.points, this.radius, this.innerRadius);
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);  // Начало линии в координатах первой частицы
        ctx.lineTo(particles[j].x, particles[j].y);  // Конец линии в координатах второй частицы
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}
animate();
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// -----------Full Screen--------------
const full_screen = document.querySelector('body');
full_screen.addEventListener('dblclick', () => {
  if (document.documentElement.requestFullscreen) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Errror ${err}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
});