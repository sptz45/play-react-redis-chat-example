package actors

import akka.actor._
import akka.pattern.pipe
import models.RoomId
import models.events._
import services.{ChatRoomMember, ChatRoomMembershipManager}

class ChatActor(
  out: ActorRef,
  registry: ActorRef,
  membershipManager: ChatRoomMembershipManager,
  roomId: RoomId,
  user: String) extends Actor {

  private var member: ChatRoomMember = _

  private val inEvents: Receive = {
    case SendMessage(msg) =>
      member.sendMessage(msg)
    case UserActivity =>
      member.registerActivity()
    case UserWentAway(accessTime) =>
      member.goAway(accessTime)
    case LeaveGroup =>
      member.leave()
      self ! PoisonPill
  }

  private val outEvents: Receive = {
    case event: OutEvent =>
      out ! event
  }

  private val joinedChat = outEvents.orElse(inEvents)

  private val waitingJoin: Receive = {
    case JoinGroup =>
      registry ! JoinRequest(roomId)
    case JoinConfirmed =>
      val membership = membershipManager.join(roomId, user)
      member = membership.member
      import context.dispatcher
      for (event <- membership.chatRoom.history) {
        event pipeTo out
      }
      context.become(joinedChat)
  }

  def receive: Receive = waitingJoin

  override def postStop(): Unit =
    if (member != null)
      member.goOffline()

}

object ChatActor {
  def props(out: ActorRef, registry: ActorRef, membershipManager: ChatRoomMembershipManager, roomId: RoomId, user: String) =
    Props(new ChatActor(out, registry, membershipManager, roomId, user))
}
