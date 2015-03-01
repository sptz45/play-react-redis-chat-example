package models

import play.api.libs.json.Json


case class User(username: String, lastAccess: Long, status: String)

object User {
  implicit val jsonFormatter = Json.format[User]
}

object UserStatus {
  val Online = "online"
  val Offline = "offline"
  val Away = "away"
}