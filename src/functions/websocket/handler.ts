import { DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@libs/dynamodb-doc-client';
import { APIGatewayProxyHandler } from 'aws-lambda';
import process from 'process';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const { eventType, connectionId } = event.requestContext;
    if (eventType === 'CONNECT') {
      await docClient.send(new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE_NAME,
        Item: { id: connectionId },
      }));
    } else if (eventType === 'DISCONNECT') {
      await docClient.send(new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE_NAME,
        Key: { id: connectionId },
      }));
    }

    return {
      statusCode: 200,
      body: '{}',
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (e as Error).message }),
    };
  }
};
