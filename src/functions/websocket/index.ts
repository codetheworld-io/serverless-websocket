import { handlerPath } from '@libs/handler-resolver';
import type { AWS } from '@serverless/typescript';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      websocket: {
        route: '$connect',
      },

    },
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
} as AWS['functions'][0];
