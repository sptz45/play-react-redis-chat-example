package controllers

import javax.inject.{Inject, Singleton}

import actors.{ChatActor, ChatRoomRegistry}
import akka.actor.ActorSystem
import akka.stream.Materializer
import models.RoomId
import models.events.{InEvent, OutEvent}
import play.api.libs.json.Json
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket.MessageFlowTransformer
import play.api.mvc._
import services.ChatSystem

import scala.concurrent.ExecutionContext

@Singleton
class Application @Inject() (implicit
  ec: ExecutionContext,
  actorSystem: ActorSystem,
  mat: Materializer) extends InjectedController {

  private implicit val flowTransformer: MessageFlowTransformer[InEvent, OutEvent] =
    MessageFlowTransformer.jsonMessageFlowTransformer[InEvent, OutEvent]

  private val chatSystem = ChatSystem.defaultSystem
  private lazy val registry = actorSystem.actorOf(ChatRoomRegistry.props)

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

  def chat(chatRoom: String, user: String) = {
    WebSocket.accept[InEvent, OutEvent] { request =>
      ActorFlow.actorRef { out =>
        ChatActor.props(out, registry, chatSystem, RoomId(chatRoom), user)
      }
    }
  }
}
