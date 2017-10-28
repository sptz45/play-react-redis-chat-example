name := "play-react-redis-chat-example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.4"

libraryDependencies ++= Seq(
  guice,
  "com.github.scredis" %% "scredis" % "2.1.1",
  "org.julienrf" %% "play-json-derived-codecs" % "4.0.0"
)

updateOptions := updateOptions.value.withCachedResolution(true)
