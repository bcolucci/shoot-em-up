'use strict';

const sprintf = require('sprintf');
const randomString = require('random-string');
const lib = require('./index');

const randomId = () => randomString() + '-' + sprintf('%04d', Math.floor(Math.random() * 1000));

let game, lastState, keyPool;

const clearKeyPool = () => {
  const tmpKeyPool = keyPool.filter(lib.Action.isNot('Escape'));
  keyPool.splice(0, keyPool.length);
  tmpKeyPool.forEach(val => { keyPool.push(val); });
};

const onConnection = socket => {
  socket.id = randomId();
  socket.on('disconnect', onDisconnection(socket));
  socket.on('keyUp', onKeyUp(socket));
  socket.on('keyDown', onKeyDown(socket));
  socket.on('nextFrame', onNextFrame(socket));
  console.log('%s connect', socket.id);
  game = new lib.Game();
  lastState = game.initialState;
  keyPool = [];
};

const onDisconnection = socket => () => {
  game = null;
  lastState = null;
  console.log('%s disconnect', socket.id);
};

const onKeyUp = socket => keyCode => {
  //console.log('%s key up %s', socket.id, keyCode);
  if(keyCode === 'Escape') return;
  const temp = keyPool.filter(key => {
    if(keyCode === 'ArrowLeft') return key !== keyCode && key !== 'ArrowRight';
    if(keyCode === 'ArrowRight') return key !== keyCode && key !== 'ArrowLeft';
    return key !== keyCode;
  });
  keyPool.splice(0, keyPool.length);
  temp.forEach(val => { keyPool.push(val); });
};

const onKeyDown = socket => keyCode => {
  //console.log('%s press down %s', socket.id, keyCode);
  if(keyPool.indexOf(keyCode) > -1) return;
  keyPool.push(keyCode);
};

const onNextFrame = socket => () => {
  const actions = keyPool.map(lib.Action.fromKeyCode).concat(lib.Action.DO_NOTHING);
  lastState = game.nextFrame(actions, lastState);
  clearKeyPool();
  socket.emit('nextFrame', lastState);
};

module.exports = http => {
  const io = require('socket.io')(http);
  io.on('connection', onConnection);
};
