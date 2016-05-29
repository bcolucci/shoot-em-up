'use strict';

const SpaceInvader = (function () {

  const DEFAULT_FIELD_WIDTH = 500;
  const DEFAULT_FIELD_HEIGHT = 900;

  const BACKGROUND_MOVE_STEP = 3;
  const SHIP_MOVE_STEP = 15;

  const DEFAULT_SHIP_WIDTH = 48;
  const DEFAULT_SHIP_HEIGHT = 48;
  const DEFAULT_SHIP_X = Math.floor(DEFAULT_FIELD_WIDTH/2 - DEFAULT_SHIP_WIDTH/2);
  const DEFAULT_SHIP_Y = Math.floor(3.7 * DEFAULT_FIELD_HEIGHT/4 - DEFAULT_SHIP_HEIGHT/2);

  const DEFAULT_METEOR_WIDTH = 64;
  const DEFAULT_METEOR_HEIGHT = 64;
  const METEOR_GENERATION_PROB = 0.08;
  const DEFAULT_METEOR_Y = -200;
  const MAX_METEORS = 10;
  const DEFAULT_METEOR_MOVE_STEP = 4;
  const FAST_METEOR_PROB = 0.25;
  const FAST_METEOR_MOVE_STEP = 8;

  const Action = {
    DO_NOTHING: 'do_nothing',
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right',
    PAUSE: 'pause'
  };

  const Meteor = Immutable.Record({
    width: DEFAULT_METEOR_WIDTH,
    height: DEFAULT_METEOR_HEIGHT,
    fast: false,
    x: 0,
    y: DEFAULT_METEOR_Y
  });

  const Field = Immutable.Record({
    width: DEFAULT_FIELD_WIDTH,
    height: DEFAULT_FIELD_HEIGHT,
    yPosition: 0
  });

  const Ship = Immutable.Record({
    width: DEFAULT_SHIP_WIDTH,
    height: DEFAULT_SHIP_HEIGHT,
    x: DEFAULT_SHIP_X,
    y: DEFAULT_SHIP_Y
  });

  const GameState = Immutable.Record({
    frameNumber: 1,
    field: new Field,
    ship: new Ship,
    meteors: [],
    paused: false
  });

  const Game = function () {

    const initialState = new GameState;

    const MIN_SHIP_X = 0;
    const MAX_SHIP_X = initialState.field.width - initialState.ship.width;

    const meteorIntoTheField = meteor => meteor.y <= initialState.field.height;
    const moveMeteor = meteor => meteor.set('y', meteor.y + (meteor.fast ? FAST_METEOR_MOVE_STEP : DEFAULT_METEOR_MOVE_STEP));

    const GameFrame = (action, previousState) => {

      const _previousState = previousState;

      if (action !== Action.PAUSE && _previousState.paused)
        return _previousState;

      let currentState = _previousState
        .set('field', _previousState.field.set('yPosition', _previousState.field.yPosition + BACKGROUND_MOVE_STEP))
        .set('frameNumber', _previousState.frameNumber + 1);

      if (action === Action.PAUSE)
        return new GameState(currentState.set('paused', !currentState.paused));

      let meteors = currentState.meteors.filter(meteorIntoTheField);
      if (Math.random() <= METEOR_GENERATION_PROB && currentState.meteors.length < MAX_METEORS) {
        const meteor = new Meteor({
          x: Math.floor(currentState.field.width * Math.random()),
          fast: Math.random() <= FAST_METEOR_PROB
        });
        meteors = meteors.concat(meteor);
      }
      meteors = meteors.map(moveMeteor);
      currentState = currentState.set('meteors', meteors);

      let ship = currentState.ship;
      if (action === Action.MOVE_LEFT)
        ship = ship.set('x', Math.max(MIN_SHIP_X, ship.x - SHIP_MOVE_STEP));
      else if (action === Action.MOVE_RIGHT)
        ship = ship.set('x', Math.min(MAX_SHIP_X, ship.x + SHIP_MOVE_STEP));

      currentState = currentState.set('ship', ship);

      return new GameState(currentState);
    };

    return {
      nextFrame: GameFrame,
      initialState: initialState
    };
  };

  return {
    Action: Action,
    Game: Game
  };

})();
