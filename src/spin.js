import { Wheel } from '../node_modules/spin-wheel/dist/spin-wheel-esm';
import sound1 from './sounds/tick.wav';
import sound2 from './sounds/time-up.mp3';
import sound3 from './sounds/time-down.mp3';

const tickAudio = new Audio(sound1);
const timeUpAudio = new Audio(sound2);
const timeDownAudio = new Audio(sound3);
let wheel = null;

const items = [
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
  {
    label: 'BAJA',
  },
  {
    label: 'SUBE',
  },
];

export const init = () => {
  const wheelContainer = document.getElementById('wheel');
  wheel = new Wheel(wheelContainer, {
    name: 'Workout',
    radius: 0.84,
    itemLabelRadius: 0.93,
    itemLabelRadiusMax: 0.35,
    itemLabelRotation: 180,
    itemLabelAlign: 'left',
    itemLabelColors: ['#fff'],
    itemLabelBaselineOffset: -0.07,
    itemLabelFont: 'Amatic SC',
    itemLabelFontSizeMax: 55,
    itemBackgroundColors: ['#66bfbf', '#d54062'],
    rotationSpeedMax: 500,
    rotationResistance: -100,
    lineWidth: 1,
    lineColor: '#fff',
    image:
      'https://crazytim.github.io/spin-wheel/examples/themes/img/example-0-image.svg',
    overlayImage:
      'https://crazytim.github.io/spin-wheel/examples/themes/img/example-0-overlay.svg',
    items,
  });
  wheel.isInteractive = false;
  const spinButton = document.getElementById('spin');
  spinButton.onclick = () => {
    const newIndex = getRandomIndex();
    console.log(`Spining to ${newIndex}`);
    wheel.spinToItem(newIndex, 5000, false, 4, 1);
  };

  wheel.onCurrentIndexChange = () => {
    tickAudio.currentTime = 0;
    tickAudio.play();
  };
  wheel.onRest = (e) => {
    if (isTimeDown(e.currentIndex)) {
      timeUpAudio.play();
    } else {
      timeDownAudio.play();
    }
  };
};

function isTimeDown(index) {
  return index % 2 === 0;
}

function getRandomIndex() {
  return Math.floor(Math.random() * items.length);
}

export const getCurrentPos = () => {
  return isTimeDown(wheel._currentIndex) ? 'DOWN' : 'UP';
};
