package models

package events {

  import julienrf.json.derived
  import play.api.libs.json._
  import scredis.serialization.{UTF8StringWriter, Writer}

  sealed  trait InEvent
  case object JoinGroup extends InEvent
  case object LeaveGroup extends InEvent
  case class SendMessage(message: String) extends InEvent
  case object UserActivity extends InEvent
  case class UserWentAway(lastAccessTime: Long) extends InEvent

  object InEvent {
    implicit val jsonFormatter: Format[InEvent] =
      derived.flat.oformat((__ \ "event").format[String])
  }

  sealed trait OutEvent
  case class NewMembers(members: Seq[User]) extends OutEvent
  case class MemberLeft(member: String) extends OutEvent
  case class MemberStatusUpdate(member: User) extends OutEvent
  case class NewMessages(messages: Seq[Message]) extends OutEvent

  object OutEvent {

    implicit val jsonFormatter: Format[OutEvent] = derived.flat.oformat((__ \ "event").format[String])

    implicit val redisWriter: Writer[OutEvent] = new Writer[OutEvent] {
      protected def writeImpl(value: OutEvent): Array[Byte] = {
        val json = Json.stringify(jsonFormatter.writes(value))
        UTF8StringWriter.write(json)
      }
    }
  }

  sealed trait InternalEvent
  case object JoinConfirmed extends InternalEvent
  case class JoinRequest(roomId: RoomId) extends InternalEvent
}
