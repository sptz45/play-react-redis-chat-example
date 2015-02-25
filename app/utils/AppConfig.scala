package utils

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.FiniteDuration
import play.api.Play.current

object AppConfig {

  val offlineUserTimeout = getDuration("my_chat.offline.timeout")

  private def getDuration(key: String) =
    current.configuration.getMilliseconds(key)
      .map(millis => FiniteDuration(millis, TimeUnit.MILLISECONDS))
      .getOrElse(sys.error(s"Please assign the '$key' property in application.conf"))
}
