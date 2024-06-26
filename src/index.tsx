import dotenv from 'dotenv';
import React from 'react';
import { render } from 'ink';
import { GameWithState } from './ui/GameWIthState';

(async () => {
  dotenv.config();
  render(<GameWithState />);
})();
