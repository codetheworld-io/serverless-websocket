import { notificationHandler, websocketHandler } from '@functions/index';
import type { AWS } from '@serverless/typescript';
import type { Configuration } from 'serverless-esbuild/dist/types';

const serverlessConfiguration: AWS = {
  service: 'serverless-websocket',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'ap-northeast-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      CONNECTIONS_TABLE_NAME: 'Connections',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ],
            Resource: [
              {
                'Fn::GetAtt': ['Connections', 'Arn'],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['execute-api:Invoke'],
            Resource: [
              'arn:aws:execute-api:${aws:region}:${aws:accountId}:*/@connections/*',
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    websocketHandler,
    notificationHandler,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['@aws-sdk'],
      target: 'es2020',
      define: { 'require.resolve': undefined } as any,
      platform: 'node',
      concurrency: 10,
      watch: {
        pattern: ['**/*.ts'],
      },
    } as Configuration,
    'serverless-offline': {
      noPrependStageInUrl: true,
      reloadHandler: true,
    },
  },
  resources: {
    Resources: {
      Connections: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'Connections',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
