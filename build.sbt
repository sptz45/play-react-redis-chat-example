name := "play-react-redis-chat-example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  "com.livestream" %% "scredis" % "2.0.7-RC1",
  "org.julienrf" %% "play-json-variants" % "2.0"
)

updateOptions := updateOptions.value.withCachedResolution(true)
