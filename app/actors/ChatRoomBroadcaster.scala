package actors

import akka.actor._
import models.RoomId
import models.events.{JoinConfirmed, JoinRequest}
import services.ChatEventsEmitter

import scala.collection.mutable.ArrayBuffer

class ChatRoomBroadcaster(eventEmitter: ChatEventsEmitter, roomId: RoomId) extends Actor {

  val subscribers = ArrayBuffer[ActorRef]()

  override def preStart(): Unit = {
    eventEmitter.startReceivingEvents(roomId, { event =>
      subscribers.foreach(_ ! event)
    })
  }

  override def postStop(): Unit = {
    eventEmitter.stopReceivingEvents(roomId)
  }

  def receive: Receive = {
    case JoinRequest(_) =>
      subscribers += sender()
      context.watch(sender())
      sender() ! JoinConfirmed
    case Terminated(subscriber) =>
      subscribers -= subscriber
      //if (subscribers.isEmpty) self ! PoisonPill
  }
}

object ChatRoomBroadcaster {
  def props(eventsEmitter: ChatEventsEmitter, roomId: RoomId) =
    Props(new ChatRoomBroadcaster(eventsEmitter, roomId))
}