package services

import models.{RoomId, UserStatus, User}
import models.events.{NewMembers, OutEvent}
import play.api.libs.json.Json
import scredis.{PubSubMessage, Redis}

import scala.concurrent.Future


class RedisChatSystem(redis: Redis) extends ChatSystem {

  def roomExists(roomId: RoomId): Future[Boolean] = {
    redis.exists(roomId.usersAccessKey)
  }

  def createChatRoom(firstUser: String): RoomId = {
    val roomId = RoomId(ChatRoomIdGenerator.generate())
    doJoin(roomId, firstUser, isCreate = true)
    roomId
  }

  def join(roomId: RoomId, username: String): ChatRoomMembership = {
    doJoin(roomId, username, isCreate = false)
    new ChatRoomMembership {
      def member: ChatRoomMember = new RedisChatMember(redis, username, roomId)
      def chatRoom: ChatRoom = new RedisChatRoom(redis, roomId)
    }
  }

  def stopReceivingEvents(roomId: RoomId): Unit = {
    redis.subscriber.unsubscribe(roomId.channelKey)
  }

  def startReceivingEvents(roomId: RoomId, handler: OutEvent => Unit): Unit = {
    redis.subscriber.subscribe(roomId.channelKey) {
      case PubSubMessage.Message(_, bytes) =>
        val event = Json.parse(bytes).as[OutEvent]
        handler(event)
    }
  }

  private def doJoin(roomId: RoomId, username: String, isCreate: Boolean) = {
    redis.withTransaction { r =>
      val lastAccess = System.currentTimeMillis()
      r.hmSet(roomId.usersAccessKey, Map(username -> lastAccess.toString))
      r.hmSet(roomId.usersStatusKey, Map(username -> UserStatus.Online))
      if (!isCreate) {
        r.publish(roomId.channelKey, NewMembers(Array(User(username, lastAccess, UserStatus.Online))): OutEvent)
      }
    }
  }
}