'use strict';

(() => {

  const FRAME_TIMEOUT = 30;

  const COLOR_WHITE = '#eee';
  const COLOR_RED = '#ff0000';

  const TEXT_MARGIN = 20;

  const TEXT_FONT = '15px Arial';

  const FIELD_COLOR = '#fff';
  const SHIP_COLOR = '#ff0000';

  const KEEP_STATES = false;

  const delay = m => (fn, ms) => {
    if (m) clearTimeout(m);
    m = setTimeout(() => fn(), ms);
  };

  const createImage = src => {
    var img = new Image();
    img.src = 'assets/' + src;
    return img;
  };

  const shipImage = createImage('ship.png');
  const fireImage = createImage('fire.png');
  const metorImage = createImage('meteor.png');
  const metorFastImage = createImage('meteor-fast.png');

  const keyPool = [];
  const states = [];

  const drawField = (canvas, field) => {
    canvas.rect(0, 0, field.width, field.height);
    canvas.canvas.style.backgroundPosition = '0px '+ field.yPosition +'px';
  };

  const drawShip = (canvas, ship) => canvas.drawImage(shipImage, ship.x, ship.y);

  const drawFire = (canvas, fire) => canvas.drawImage(fireImage, fire.x, fire.y);
  const drawFires = (canvas, fires) => fires.forEach(fire => drawFire(canvas, fire));

  const drawMeteor = (canvas, meteor) => canvas.drawImage(meteor.fast ? metorFastImage : metorImage, meteor.x, meteor.y);
  const drawMeteors = (canvas, meteors) => meteors.forEach(meteor => drawMeteor(canvas, meteor));

  const createCanvas = field => {
    const canvas = window.document.createElement('canvas');
    canvas.width = field.width;
    canvas.height = field.height;
    window.document.body.appendChild(canvas);
    return canvas.getContext('2d');
  };

  const clearCanvas = canvas => canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

  const writeFrameInfos = (canvas, state) => {
    let textIndex = 0;
    const write = str => canvas.fillText(str, 20, textIndex++ * TEXT_MARGIN + 30);
    canvas.fillStyle = COLOR_WHITE;
    canvas.font = TEXT_FONT;
    write('Frame: ' + state.frameNumber);
    write('Field yPosition: ' + state.field.yPosition);
    write('Score: ' + state.score);
    write('Level: ' + state.level);
    write('Nb. meteors: ' + state.meteors.length);
    write('Nb. fires: ' + state.fires.length);
    write('Ship: (' + state.ship.x + ', ' + state.ship.y + ')');
    if (state.paused) {
      canvas.fillStyle = COLOR_RED;
      write('Pause');
    }
  };

  const keyToAction = keyCode => {
    if (keyCode === 'Escape')
      return SpaceInvader.Action.PAUSE;
    if (keyCode === 'ArrowLeft')
      return SpaceInvader.Action.MOVE_LEFT;
    if (keyCode === 'ArrowRight')
      return SpaceInvader.Action.MOVE_RIGHT;
    if (keyCode === 'Space')
      return SpaceInvader.Action.FIRE;
    return SpaceInvader.Action.DO_NOTHING;
  };

  const startGame = () => {

    const game = new SpaceInvader.Game;

    const drawFrame = (canvas, state) => {
      clearCanvas(canvas);
      drawField(canvas, state.field);
      writeFrameInfos(canvas, state);
      drawMeteors(canvas, state.meteors);
      drawShip(canvas, state.ship);
      drawFires(canvas, state.fires);
    };

    const canvas = createCanvas(game.initialState.field);

    (function goNextFrame(previousState) {

      if (KEEP_STATES)
        states.push(previousState);

      const actions = keyPool.map(keyToAction).concat(SpaceInvader.Action.DO_NOTHING);

      const currentState = game.nextFrame(actions, previousState);

      const temp = keyPool.filter(val => {
        return val !== 'Escape';
      });
      keyPool.splice(0,keyPool.length);
      temp.forEach(val => {
        keyPool.push(val);
      });

      drawFrame(canvas, currentState);

      setTimeout(() => goNextFrame(currentState), FRAME_TIMEOUT);

    })(game.initialState);

  };

  let keyMutex = null;
  let keyDelay = delay(keyMutex);
  const onKeyPress = e => keyDelay(() => keyPool.push(e.code), FRAME_TIMEOUT * 2);

  window.addEventListener('load', startGame);
  window.addEventListener('keydown', e => {
    if(keyPool.indexOf(e.code) > -1) return;
    onKeyPress(e);
  });
  window.addEventListener('keyup', e => {
    if(e.code === 'Escape') return;
    const temp = keyPool.filter(val => {
      if(e.code === 'ArrowLeft')
        return val !== e.code && val !== 'ArrowRight';
      if(e.code === 'ArrowRight')
        return val !== e.code && val !== 'ArrowLeft';
      return val !== e.code;
    });
    keyPool.splice(0,keyPool.length);
    temp.forEach(val => {
      keyPool.push(val);
    });
  });

})();
