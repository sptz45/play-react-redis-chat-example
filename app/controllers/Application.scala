package controllers

import actors.ChatActor
import models.RoomId
import models.events.{OutEvent, InEvent}
import play.api.libs.json.Json
import play.api.mvc._
import play.api.Play.current
import services.ChatSystem

object Application extends Controller {

  import play.api.libs.concurrent.Execution.Implicits._

  val chatSystem = ChatSystem.defaultSystem

  def index = Action(Ok(views.html.index()))

  def index2(chatRoom: String) = Action.async {
    chatSystem.roomExists(RoomId(chatRoom)).map { exists =>
      if (exists) Ok(views.html.index())
      else NotFound(views.html.notFound())
    }
  }

  def create(username: String) = Action {
    val roomId = chatSystem.createChatRoom(username)
    Ok(Json.obj("roomId" -> roomId.id))
  }

  def chat(chatRoom: String, user: String) = WebSocket.acceptWithActor[InEvent, OutEvent] {
    request => out =>
      ChatActor.props(out, chatSystem, RoomId(chatRoom), user)
  }
}
