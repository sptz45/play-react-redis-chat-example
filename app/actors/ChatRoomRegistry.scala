package actors

import akka.actor._
import models.RoomId
import models.events.JoinRequest
import play.api.libs.concurrent.Akka
import play.api.Play.current
import services.ChatSystem

import scala.collection.mutable


class ChatRoomRegistry extends Actor {

  private val chatSystem = ChatSystem.defaultSystem
  private val chatRoomActors = mutable.HashMap[RoomId, ActorRef]()

  def receive: Receive = {
    case request: JoinRequest =>
      val chatRoom = chatRoomActors.getOrElseUpdate(request.roomId, newChatRoomActor(request.roomId))
      chatRoom.forward(request)
  }

  private def newChatRoomActor(roomId: RoomId) = {
    context.actorOf(ChatRoomBroadcaster.props(chatSystem, roomId), name = roomId.id)
  }
}

object ChatRoomRegistry {

  def props = Props(new ChatRoomRegistry)
}
