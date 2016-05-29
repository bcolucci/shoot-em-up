'use strict';

(() => {

  const FRAME_TIMEOUT = 30;

  const COLOR_WHITE = '#fff';
  const COLOR_RED = '#ff0000';

  const TEXT_MARGIN = 25;

  const TEXT_FONT = '20px Arial';

  const FIELD_COLOR = '#fff';
  const SHIP_COLOR = '#ff0000';

  const KEEP_STATES = false;

  const createImage = src => {
    var img = new Image();
    img.src = 'assets/' + src;
    return img;
  };

  const shipImage = createImage('ship.png');
  const metorImage = createImage('meteor.png');
  const metorFastImage = createImage('meteor-fast.png');

  const keyPool = [];
  const states = [];

  const drawField = (canvas, field) => {
    canvas.rect(0, 0, field.width, field.height);
    canvas.canvas.style.backgroundPosition = '0px '+ field.yPosition +'px';
  };

  const drawShip = (canvas, ship) => canvas.drawImage(shipImage, ship.x, ship.y);

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
    const xRef = 20;
    const yRef = 30;
    let textIndex = 0;
    canvas.fillStyle = COLOR_WHITE;
    canvas.font = TEXT_FONT;
    canvas.fillText('Frame: ' + state.frameNumber, xRef, yRef);
    canvas.fillText('Field yPosition: ' + state.field.yPosition, xRef, yRef + ++textIndex*TEXT_MARGIN);
    canvas.fillText('Nb. meteors: ' + state.meteors.length, xRef, yRef + ++textIndex*TEXT_MARGIN);
    canvas.fillText('Ship: (' + state.ship.x + ', ' + state.ship.y + ')', xRef, yRef + ++textIndex*TEXT_MARGIN);
    if (state.paused) {
      canvas.fillStyle = COLOR_RED;
      canvas.fillText('Pause', xRef, yRef + ++textIndex*TEXT_MARGIN);
    }
  };

  const startGame = () => {

    const Action = SpaceInvader.Action;
    const game = new SpaceInvader.Game;

    const drawFrame = (canvas, state) => {
      clearCanvas(canvas);
      drawField(canvas, state.field);
      writeFrameInfos(canvas, state);
      drawMeteors(canvas, state.meteors);
      drawShip(canvas, state.ship);
    };

    const canvas = createCanvas(game.initialState.field);

    (function goNextFrame(keyPool, previousState) {

      if (KEEP_STATES)
        states.push(previousState);

      const keyCode = keyPool.pop();
      keyPool.splice(0, keyPool.length);

      let action = Action.DO_NOTHING;
      if (keyCode === 'Escape')
        action = Action.PAUSE;
      else if (keyCode === 'ArrowLeft')
        action = Action.MOVE_LEFT;
      else if (keyCode === 'ArrowRight')
        action = Action.MOVE_RIGHT;

      const currentState = game.nextFrame(action, previousState);
      //console.log(keyCode, action, currentState);

      drawFrame(canvas, currentState);

      setTimeout(() => goNextFrame(keyPool, currentState), FRAME_TIMEOUT);

    })(keyPool, game.initialState);

  };

  const onKeyPress = e => keyPool.push(e.code);

  window.addEventListener('load', startGame);
  window.addEventListener('keydown', onKeyPress);
  window.addEventListener('keyup', e => onKeyPress);

})();
