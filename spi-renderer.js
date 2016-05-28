'use strict';

const SpiRenderer = () => {

  const FRAME_TIMEOUT = 30;
  const FRAME_NUMBER_COLOR = '#0000ff';
  const FRAME_NUMBER_FONT = '30px Arial';
  const FIELD_COLOR = '#fff';
  const SHIP_COLOR = '#ff0000';
  const KEEP_STATES = false;

  const keyPool = [];
  const states = [];

  const drawField = (canvas, field) => canvas.rect(0, 0, field.width, field.height);

  const drawShip = (canvas, ship) => {
    canvas.fillStyle = SHIP_COLOR;
    canvas.fillRect(ship.x, ship.y, ship.width, ship.height);
  };

  const createCanvas = field => {
    const canvas = window.document.createElement('canvas');
    canvas.width = field.width;
    canvas.height = field.height;
    window.document.body.appendChild(canvas);
    return canvas.getContext('2d');
  };

  const clearCanvas = canvas => {
    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.fillStyle = FIELD_COLOR;
    canvas.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.strokeRect(0, 0, canvas.canvas.width, canvas.canvas.height);
  };

  const writeFrameNumber = (canvas, frameNumber) => {
    canvas.fillStyle = FRAME_NUMBER_COLOR;
    canvas.font = FRAME_NUMBER_FONT;
    canvas.fillText('Frame ' + frameNumber, 20, 40);
  };

  const startGame = () => {

    const Action = SpiLib.Action;
    const game = new SpiLib.Game;

    const drawFrame = (canvas, state) => {
      clearCanvas(canvas);
      writeFrameNumber(canvas, state.frameNumber);
      drawField(canvas, state.field);
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

};
