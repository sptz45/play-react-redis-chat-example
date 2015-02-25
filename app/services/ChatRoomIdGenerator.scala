package services

import java.util.Random

object ChatRoomIdGenerator {

  private val rnd = new Random

  def generate(): String = rnd.nextInt(1000000).toString
}