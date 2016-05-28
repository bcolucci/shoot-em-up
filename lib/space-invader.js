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

  const Action = {
    DO_NOTHING: 'do_nothing',
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right',
    PAUSE: 'pause'
  };

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
    paused: false
  });

  const Game = function () {

    const initialState = new GameState;

    const MIN_SHIP_X = 0;
    const MAX_SHIP_X = initialState.field.width - initialState.ship.width;

    const GameFrame = (action, previousState) => {

      const _previousState = previousState;

      if (action !== Action.PAUSE && _previousState.paused)
        return _previousState;

      let currentState = _previousState
        .set('field', _previousState.field.set('yPosition', _previousState.field.yPosition + BACKGROUND_MOVE_STEP))
        .set('frameNumber', _previousState.frameNumber + 1);

      if (action === Action.PAUSE) {
        currentState = currentState.set('paused', !currentState.paused);
      } else {

        let ship = currentState.ship;
        if (action === Action.MOVE_LEFT)
          ship = ship.set('x', Math.max(MIN_SHIP_X, ship.x - SHIP_MOVE_STEP));
        else if (action === Action.MOVE_RIGHT)
          ship = ship.set('x', Math.min(MAX_SHIP_X, ship.x + SHIP_MOVE_STEP));

        currentState = currentState.set('ship', ship);

      }

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
