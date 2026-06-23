export const isThreadParticipant = (thread, userId) =>
  thread.tenantId.toString() === userId.toString() ||
  thread.ownerId.toString() === userId.toString();

export const getOtherParticipantId = (thread, userId) =>
  thread.tenantId.toString() === userId.toString()
    ? thread.ownerId
    : thread.tenantId;

export const parseTokenFromHandshake = (handshake) => {
  if (handshake.auth?.token) {
    return handshake.auth.token;
  }

  const authHeader = handshake.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieHeader = handshake.headers?.cookie;
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(tokenCookie.slice("token=".length));
};
