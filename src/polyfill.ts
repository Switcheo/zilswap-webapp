import * as buffer from 'buffer';
(window as any).Buffer = buffer.Buffer;
global.process = global.process || require('process');
