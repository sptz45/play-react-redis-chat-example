package models

package events {

  import play.api.libs.json._
  import play.api.mvc.WebSocket.FrameFormatter
  import scredis.serialization.{UTF8StringWriter, Writer}

  sealed  trait InEvent
  case object JoinGroup extends InEvent
  case object LeaveGroup extends InEvent
  case class SendMessage(message: String) extends InEvent
  case object UserActivity extends InEvent
  case class UserWentAway(lastAccessTime: Long) extends InEvent

  object InEvent {
    implicit val jsonFormatter: Format[InEvent] = new Format[InEvent] {
      def reads(json: JsValue): JsResult[InEvent] = {
        (json \ "event").as[String] match {
          case "user_activity" => JsSuccess(UserActivity)
          case "user_away" => JsSuccess(UserWentAway((json \ "lastAccessTime").as[Long]))
          case "new_message" => JsSuccess(SendMessage((json \ "message").as[String]))
          case "join" => JsSuccess(JoinGroup)
          case "leave" => JsSuccess(LeaveGroup)
          case other => JsError(s"Unknown event type $other")
        }
      }
      def writes(o: InEvent): JsValue = o match {
        case UserActivity => Json.obj("event" -> "user_activity")
        case UserWentAway(accessTime) => Json.obj("event" -> "user_away", "lastAccessTime" -> accessTime)
        case SendMessage(msg) => Json.obj("event" -> "new_message", "message" -> msg)
        case JoinGroup => Json.obj("event" -> "join")
        case LeaveGroup => Json.obj("event" -> "leave")
      }
    }
    implicit val inEventFrameFormatter = FrameFormatter.jsonFrame[InEvent]
  }

  sealed trait OutEvent
  case class NewMembers(members: Array[User]) extends OutEvent
  case class MemberLeft(member: String) extends OutEvent
  case class MemberStatusUpdate(member: User) extends OutEvent
  case class NewMessages(messages: Array[Message]) extends OutEvent

  object OutEvent {

    implicit val jsonFormatter: Format[OutEvent] = new Format[OutEvent] {
      def reads(json: JsValue): JsResult[OutEvent] = {
        (json \ "event").as[String] match {
          case "new_members" => JsSuccess(NewMembers((json \ "members").as[Array[User]]))
          case "member_left" => JsSuccess(MemberLeft((json \ "member").as[String]))
          case "member_status" => JsSuccess(MemberStatusUpdate((json \ "member").as[User]))
          case "new_messages" => JsSuccess(NewMessages((json \ "messages").as[Array[Message]]))
          case other => JsError(s"Unknown event type $other")
        }
      }
      def writes(o: OutEvent): JsValue = o match {
        case NewMembers(members) => Json.obj("event" -> "new_members", "members" -> members)
        case MemberLeft(member) => Json.obj("event" -> "member_left", "member" -> member)
        case MemberStatusUpdate(member) => Json.obj("event" -> "member_status", "member" -> member)
        case NewMessages(messages) => Json.obj("event" -> "new_messages", "messages" -> messages)
      }
    }

    implicit val outEventFrameFormatter = FrameFormatter.jsonFrame[OutEvent]

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
