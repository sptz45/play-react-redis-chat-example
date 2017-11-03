package services

import models.RoomId
import models.events.OutEvent
import scredis.Redis

import scala.concurrent.Future

trait ChatEventsEmitter {
  def startReceivingEvents(roomId: RoomId, handler: OutEvent => Unit): Unit
  def stopReceivingEvents(roomId: RoomId): Unit
}

trait ChatRoomMembershipManager {
  def join(roomId: RoomId, username: String): ChatRoomMembership
}

trait ChatSystem extends ChatEventsEmitter with ChatRoomMembershipManager {
  def roomExists(roomId: RoomId): Future[Boolean]
  def createChatRoom(firstUser: String): RoomId
}

trait ChatRoomMembership {
  def member: ChatRoomMember
  def chatRoom: ChatRoom
}

trait ChatRoomMember {
  def leave(): Unit
  def goOffline(): Unit
  def goAway(lastAccessTime: Long): Unit
  def registerActivity(): Unit
  def sendMessage(message: String): Unit
}


trait ChatRoom {
  def history: Seq[Future[OutEvent]]
}
