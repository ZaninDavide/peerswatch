import crypto from "node:crypto"

export function findFreeRoomId(rooms) {
  let id;
  do {
    id = crypto.randomBytes(6).toString("base64url");
  } while (rooms.has(id));
  return id;
}

function findIdsOfRoomsWithUser(rooms, userId) {
  return [...rooms]
  .filter(([_, room]) => room.has(userId))
  .map(([roomId, _]) => roomId)
}

export function notifyPeersCountChange(io, room) {
  // Notify all peers about the change in peers count
  room.forEach(peerId => { io.to(peerId).emit("peers-count", room.size) })
}

export function smartGetUserRoom(io, rooms, userRoomId, userId) {
  if (
    userRoomId !== null && 
    rooms.get(userRoomId)?.has(userId)
  ) return userRoomId

  const found = findIdsOfRoomsWithUser(rooms, userId)
  if (found.length === 1) return found[0]

  for (const roomId of found) {
    const room = rooms.get(roomId)
    room.delete(userId)
    if (room.size === 0) {
      rooms.delete(roomId)
    } else {
      notifyPeersCountChange(io, room)
    }
  }

  return null
}