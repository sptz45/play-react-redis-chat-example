name := "play-react-redis-chat-example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.5"

libraryDependencies ++= Seq(
  "com.livestream" % "scredis_2.11" % "2.0.7-RC1",
  "org.julienrf" %% "play-json-variants" % "1.1.0"
)
