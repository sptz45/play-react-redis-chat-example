package actors

import javax.inject.Inject

import akka.actor._
import models.RoomId
import models.events.JoinRequest
import services.ChatSystem

import scala.collection.mutable


class ChatRoomRegistry @Inject() (chatSystem: ChatSystem) extends Actor {

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
