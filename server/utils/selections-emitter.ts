import { EventEmitter } from 'node:events';

export const selectionsEmitter = new EventEmitter();
selectionsEmitter.setMaxListeners(100);
