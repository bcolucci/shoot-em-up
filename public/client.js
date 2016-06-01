'use strict';

const ShootEmUpClient = socket => {

  const FRAME_TIMEOUT = 30;

  const COLOR_WHITE = '#eee';
  const COLOR_RED = '#ff0000';

  const TEXT_MARGIN = 20;

  const TEXT_FONT = '15px Arial';

  const FIELD_COLOR = '#fff';
  const SHIP_COLOR = '#ff0000';

  const createImage = src => {
    var img = new Image();
    img.src = 'public/images/' + src;
    return img;
  };

  const shipImage = createImage('ship.png');
  const fireImage = createImage('fire.png');
  const metorImage = createImage('meteor.png');
  const metorFastImage = createImage('meteor-fast.png');

  const drawField = (canvas, field) => {
    canvas.rect(0, 0, field.width, field.height);
    canvas.canvas.style.backgroundPosition = '0px '+ field.yPosition +'px';
  };

  const drawShip = (canvas, ship) => canvas.drawImage(shipImage, ship.x, ship.y);

  const drawFire = (canvas, fire) => canvas.drawImage(fireImage, fire.x, fire.y);
  const drawFires = (canvas, fires) => fires.forEach(fire => drawFire(canvas, fire));

  const drawMeteor = (canvas, meteor) => canvas.drawImage(meteor.fast ? metorFastImage : metorImage, meteor.x, meteor.y);
  const drawMeteors = (canvas, meteors) => meteors.forEach(meteor => drawMeteor(canvas, meteor));

  const retrieveCanvas = field => {
    let canvas = window.document.querySelector('canvas');
    if (canvas) return canvas.getContext('2d');
    canvas = window.document.createElement('canvas');
    canvas.width = field.width;
    canvas.height = field.height;
    window.document.body.appendChild(canvas);
    return retrieveCanvas(field);
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

  const drawFrame = (canvas, state) => {
    clearCanvas(canvas);
    drawField(canvas, state.field);
    writeFrameInfos(canvas, state);
    drawMeteors(canvas, state.meteors);
    drawShip(canvas, state.ship);
    drawFires(canvas, state.fires);
  };

  const keyCodeName = keyCode => {
    if (keyCode === 27) return 'Escape';
    if (keyCode === 37) return 'ArrowLeft';
    if (keyCode === 39) return 'ArrowRight';
    if (keyCode === 32) return ' ';
  };

  const emitKeyPress = keyType => keyCode => socket.emit(keyType, keyCode);
  const emitKeyDownPress = emitKeyPress('keyDown');
  const emitKeyUpPress = emitKeyPress('keyUp');

  const isKey = keys => event => [].concat(keys).indexOf(keyCodeName(event.keyCode)) > -1;

  const property = prop => o => o[prop];
  const keyProperty = property('key');

  const keyEventStream = eventType => $(window).asEventStream(eventType)
    .filter(isKey([ ' ', 'Escape', 'ArrowLeft', 'ArrowRight' ]));

  keyEventStream('keydown').map(keyProperty).onValue(emitKeyDownPress);
  keyEventStream('keyup').map(keyProperty).onValue(emitKeyUpPress);

  let canvas;
  socket.on('nextFrame', state => {
    if (!canvas) canvas = retrieveCanvas(state.field);
    drawFrame(canvas, state);
  });

  setInterval(() => socket.emit('nextFrame'), FRAME_TIMEOUT);
};
