package models

import play.api.libs.json.Json
import scredis.serialization.{Reader, UTF8StringWriter, Writer}

case class Message(user: String, timestamp: Long, message: String)

object Message {
  implicit val jsonFormatter = Json.format[Message]

  implicit val redisWriter: Writer[Message] = new Writer[Message] {
    protected def writeImpl(value: Message): Array[Byte] = {
      val json = Json.stringify(jsonFormatter.writes(value))
      UTF8StringWriter.write(json)
    }
  }

  implicit val redisReader: Reader[Message] = new Reader[Message] {
    protected def readImpl(bytes: Array[Byte]): Message = {
      Json.parse(bytes).as[Message]
    }
  }
}
