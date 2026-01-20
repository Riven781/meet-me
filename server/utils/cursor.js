export function encodeCursor({ lastCreatedAt, lastId }) {
  const cursorStr = JSON.stringify({ lastCreatedAt, lastId });
  return Buffer.from(cursorStr).toString('base64');
}

export function decodeCursor(cursor) {
  const cursorStr = Buffer.from(cursor, 'base64').toString('utf8');
  return JSON.parse(cursorStr);
}