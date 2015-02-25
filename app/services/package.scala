import models.RoomId

package object services {

  implicit class RedisKeyOps(val roomId: RoomId) extends AnyVal {
    def channelKey     = s"room:${roomId.id}"
    def messagesKey    = s"room:${roomId.id}:messages"
    def usersAccessKey = s"room:${roomId.id}:usersAccess"
    def usersStatusKey = s"room:${roomId.id}:usersStatus"
  }
}
