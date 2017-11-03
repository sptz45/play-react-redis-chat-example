package modules

import actors.ChatRoomRegistry
import com.google.inject.AbstractModule
import play.api.libs.concurrent.AkkaGuiceSupport
import scredis.Redis
import services.{ChatSystem, RedisChatSystem}

class AppModule extends AbstractModule with AkkaGuiceSupport {

  def configure(): Unit = {
    bind(classOf[ChatSystem]).toInstance(new RedisChatSystem(new Redis))
    bindActor[ChatRoomRegistry]("roomRegistry")
  }
}
