import tmi from 'tmi.js';
import { init } from './spin';

init();

const containerDiv = document.getElementById('container');
const tokenInput = document.getElementById('token');
const connectButton = document.getElementById('connect');

const SECONDS_PER_BIT = 2;
const SECONDS_PER_SUB_GIFTED_TIER_1 = 240;
const SECONDS_PER_SUB_GIFTED_TIER_2 = 360;
const SECONDS_PER_SUB_GIFTED_TIER_3 = 600;

function isPair(num) {
  return num % 2 === 0;
}

//CONTADOR

function secondsToHms(seconds) {
  // Asegúrate de que sea un número
  seconds = Number(seconds);

  // Calcula las horas, minutos y segundos
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  // Formatea los resultados para que siempre tengan dos dígitos
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  // Devuelve el resultado en formato hh:mm:ss
  return `${hh}:${mm}:${ss}`;
}

const contador = document.getElementById('contador');
const iniciar = document.getElementById('start');
const pausar = document.getElementById('pause');
const resumeButton = document.getElementById('resume');
const sumarButton = document.getElementById('sumar');
const restarButton = document.getElementById('restar');
const cambiarInput = document.getElementById('cambiar');
const tokenContainer = document.getElementById('tokenContainer');

let remainSeconds = 0;
contador.innerText = secondsToHms(remainSeconds);

let interval = 0;

function inputsToSeconds() {
  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');
  const total =
    Number(seconds.value) +
    Number(minutes.value * 60) +
    Number(hours.value * 60 * 60);
  seconds.value = 0;
  minutes.value = 0;
  hours.value = 0;
  return total;
}

function startTimer() {
  pausar.disabled = false;
  iniciar.disabled = true;
  resumeButton.disabled = true;
  remainSeconds = inputsToSeconds();
  contador.innerText = secondsToHms(remainSeconds);
  clearInterval(interval);
  interval = setInterval(() => {
    changeSeconds();
  }, 1000);
}

function changeSeconds() {
  remainSeconds--;
  contador.innerText = secondsToHms(remainSeconds);
}

function pause() {
  pausar.disabled = true;
  iniciar.disabled = false;
  resumeButton.disabled = false;
  clearInterval(interval);
}

function resume() {
  resumeButton.disabled = true;
  pausar.disabled = false;
  contador.innerText = secondsToHms(remainSeconds);
  interval = setInterval(() => {
    changeSeconds();
  }, 1000);
}

function sumar() {
  changeRemain(remainSeconds + +cambiarInput.value);
  cambiarInput.value = 0;
}

function restar() {
  changeRemain(remainSeconds - +cambiarInput.value);
  cambiarInput.value = 0;
}

iniciar.onclick = startTimer;
pausar.onclick = pause;
resumeButton.onclick = resume;
restarButton.onclick = restar;
sumarButton.onclick = sumar;

/**
 * TWTICH
 */
function changeRemain(newRemain) {
  remainSeconds = newRemain;
  contador.innerText = secondsToHms(remainSeconds);
}

let client = null;

const startApp = () => {
  const token = tokenInput.value;
  if (token == '') {
    return;
  }
  iniciar.disabled = false;
  tokenContainer.style.display = 'none';
  tokenInput.value = '';
  // containerDiv.style.display = 'block';
  client = new tmi.Client({
    options: {
      debug: false,
    },
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      username: 'lalizzysvt',
      password: token,
    },
    channels: ['lalizzysvt'],
  });

  client.on('cheer', (channel, userstate, message) => {
    const bitsCounts = +userstate['bits'];
    const sumTotal = isPair(bitsCounts) ? -bitsCounts : +bitsCounts;
    changeRemain(remainSeconds + sumTotal * SECONDS_PER_BIT);
    sendToDiscord(
      `${userstate['display-name']} agregó ${
        sumTotal * SECONDS_PER_BIT
      } al tiempo por ${userstate['bits']} bits: ${message}`
    );
  });

  client.on('subscription', (channel, username, method, message, userstate) => {
    const subTier = userstate['msg-param-sub-plan'];
    let totalSum = 0;
    switch (subTier) {
      case '1000':
        totalSum = SECONDS_PER_SUB_GIFTED_TIER_1;
        break;
      case '2000':
        totalSum = SECONDS_PER_SUB_GIFTED_TIER_2;
        break;
      case '3000':
        totalSum = SECONDS_PER_SUB_GIFTED_TIER_3;
        break;
      default:
        totalSum = SECONDS_PER_SUB_GIFTED_TIER_1;
        break;
    }

    changeRemain(remainSeconds + totalSum);

    sendToDiscord(`${username} ha sumado ${totalSum} con su primera sub`);
  });

  client.on(
    'resub',
    (channel, username, months, message, userstate, methods) => {
      const subTier = userstate['msg-param-sub-plan'];
      let totalSum = 0;
      switch (subTier) {
        case '1000':
          totalSum = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
        case '2000':
          totalSum = SECONDS_PER_SUB_GIFTED_TIER_2;
          break;
        case '3000':
          totalSum = SECONDS_PER_SUB_GIFTED_TIER_3;
          break;
        default:
          totalSum = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
      }

      changeRemain(remainSeconds + totalSum);

      sendToDiscord(`${username} ha sumado ${totalSum} con una resub`);
    }
  );

  // Manejar giftsub (suscripciones regaladas)
  client.on(
    'subgift',
    (channel, username, streakmonths, recipient, methods, userstate) => {
      const giftCount = userstate['msg-param-mass-gift-count'] || 1;
      const subTier = userstate['msg-param-sub-plan']; //1000 2000 3000
      let sumTotal = 0;
      switch (subTier) {
        case '1000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
        case '2000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_2;
          break;
        case '3000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_3;
          break;
        default:
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
      }
      if (isPair(giftCount)) {
        changeRemain(remainSeconds - sumTotal);
        sendToDiscord(
          `${username} ha sumado ${sumTotal} regalando ${giftCount} subs`
        );
      } else {
        changeRemain(remainSeconds + sumTotal);
        sendToDiscord(
          `${username} ha restado ${sumTotal} regalando ${giftCount} subs`
        );
      }
    }
  );

  client.on(
    'anonsubgift',
    (channel, streakMonths, recipient, methods, userstate) => {
      const giftCount = userstate['msg-param-mass-gift-count'] || 1;
      const subTier = userstate['msg-param-sub-plan']; //1000 2000 3000
      let sumTotal = 0;
      switch (subTier) {
        case '1000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
        case '2000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_2;
          break;
        case '3000':
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_3;
          break;
        default:
          sumTotal = SECONDS_PER_SUB_GIFTED_TIER_1;
          break;
      }
      if (isPair(giftCount)) {
        changeRemain(remainSeconds - sumTotal);
        sendToDiscord(
          `Anónimo ha sumado ${sumTotal} regalando ${giftCount} subs`
        );
      } else {
        changeRemain(remainSeconds + sumTotal);
        sendToDiscord(
          `Anónimo ha restado ${sumTotal} regalando ${giftCount} subs`
        );
      }
    }
  );

  client.connect();
};

connectButton.onclick = startApp;
const testButton = document.getElementById('test');

testButton.onclick = () => {
  simulateCheer(100, 'mensaje prueba');
};

function sendToDiscord(text) {
  const data = {
    content: text,
  };

  fetch(
    'https://discord.com/api/webhooks/1253968314640891924/cgkqARHOrly1nR32dnjQVjUNUX7jyiHq7sclcDORj5zexnIC4ONKYq-XzjigQgsH1N0N',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )
    .then((response) => {
      if (response.ok) {
        console.log('Mensaje enviado correctamente mediante webhook');
      } else {
        console.error(
          'Error al enviar el mensaje mediante webhook:',
          response.statusText
        );
      }
    })
    .catch((error) => {
      console.error(
        'Error inesperado al enviar el mensaje mediante webhook:',
        error
      );
    });
}

function simulateCheer(bits, message) {}
