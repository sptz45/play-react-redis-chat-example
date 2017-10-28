package services

import models.{Message, RoomId, User, UserStatus}
import models.events.{MemberLeft, MemberStatusUpdate, NewMessages, OutEvent}
import scredis.{Redis, Score}

import scala.util.{Failure, Success}


class RedisChatMember(redis: Redis, user: String, roomId: RoomId) extends ChatRoomMember {

  def leave(): Unit = {
    redis.withTransaction { r =>
      r.sRem(roomId.usersAccessKey, user)
      r.sRem(roomId.usersStatusKey, user)
      r.publish(roomId.channelKey, MemberLeft(user): OutEvent)
    }
  }

  def goAway(lastAccessTime: Long): Unit = {
    redis.withTransaction { r =>
      r.hSet(roomId.usersStatusKey, user, UserStatus.Offline)
      r.hSet(roomId.usersAccessKey, user, lastAccessTime.toString)
      val updatedUser = User(user, lastAccessTime, UserStatus.Offline)
      r.publish(roomId.channelKey, MemberStatusUpdate(updatedUser): OutEvent)
    }
  }

  def goOffline(): Unit = {
    import redis.dispatcher
    redis.hSet(roomId.usersStatusKey, user, UserStatus.Offline)
    redis.hGet(roomId.usersAccessKey, user).onComplete {
      case Success(Some(accessTime)) =>
        val updatedUser = User(user, accessTime.toLong, UserStatus.Offline)
        redis.publish(roomId.channelKey, MemberStatusUpdate(updatedUser): OutEvent)
      case _ => ()
    }
  }

  def sendMessage(message: String): Unit = {
    val msg = Message(user, System.currentTimeMillis(), message)
    redis.withTransaction { r =>
      r.zAdd(roomId.messagesKey, msg, Score.Value(msg.timestamp.toDouble))
      r.publish(roomId.channelKey, NewMessages(Array(msg)): OutEvent)
    }
  }

  def registerActivity(): Unit = {
    redis.withTransaction { r =>
      val accessTime = System.currentTimeMillis()
      r.hSet(roomId.usersAccessKey, user, accessTime.toString)
      r.hSet(roomId.usersStatusKey, user, UserStatus.Online)
      val updatedUser = User(user, accessTime, UserStatus.Online)
      r.publish(roomId.channelKey, MemberStatusUpdate(updatedUser): OutEvent)
    }
  }
}
