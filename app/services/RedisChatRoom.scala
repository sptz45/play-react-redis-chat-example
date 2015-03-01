package services

import models.{UserStatus, RoomId, Message, User}
import models.events.{NewMessages, NewMembers, OutEvent}
import scredis.Redis

import scala.concurrent.Future

class RedisChatRoom(redis: Redis, roomId: RoomId) extends ChatRoom {

  import redis.dispatcher

  def history: Seq[Future[OutEvent]] = {
    val newUsers = users.map(users => NewMembers(users.toSeq))
    val newMessages = messages.map(messages => NewMessages(messages.toSeq))
    Seq(newUsers, newMessages)
  }

  private def users = {
    val accessTimesF = redis.hGetAll(roomId.usersAccessKey)
    val statusesF = redis.hGetAll(roomId.usersStatusKey)
    for {
      accessTimesOpt <- accessTimesF
      statusesOpt <- statusesF
    } yield {
      val  accessTimes = accessTimesOpt.getOrElse(Map.empty)
      val statuses = statusesOpt.getOrElse(Map.empty)
      for ((username, accessTime) <- accessTimes)
      yield User(username, accessTime.toLong, statuses.getOrElse(username, UserStatus.Offline))
    }
  }

  private def messages = redis.zRange[Message](roomId.messagesKey)
}