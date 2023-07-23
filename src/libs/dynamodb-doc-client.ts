import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import process from 'process';

const client = new DynamoDBClient(
  process.env.IS_OFFLINE === 'true'
    ? {
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    }
    : {},
);
export const docClient = DynamoDBDocumentClient.from(client);
