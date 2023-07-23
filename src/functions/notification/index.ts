import { handlerPath } from '@libs/handler-resolver';
import type { AWS } from '@serverless/typescript';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'notifications',
      },
    },
  ],
  environment: {
    WEBSOCKET_ENDPOINT: {
      'Fn::Join': [
        '',
        [
          'https://',
          { Ref: 'WebsocketsApi' },
          '.execute-api.${aws:region}.amazonaws.com/${sls:stage}',
        ],
      ],
    },
  },
} as AWS['functions'][0];
