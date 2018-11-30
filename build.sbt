name := """Gifter"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.6"

resolvers ++= Seq(
  "Atlassian Releases" at "https://maven.atlassian.com/public/",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"
)
resolvers += Resolver.jcenterRepo

libraryDependencies ++= Seq(
  ehcache,
  evolutions,
  guice,
  // anorm is now an external dependency (since play2.4)
  "com.typesafe.play" %% "anorm" % "2.5.3",
  // use http://play-bootstrap3.herokuapp.com/
  "com.adrianhurt" %% "play-bootstrap" % "1.2-P26-B3",
  // silouhette to handle google/yahoo authentification dude dude dude
  "com.mohiva" %% "play-silhouette" % "5.0.2",
  "com.mohiva" %% "play-silhouette-persistence" % "5.0.2",
  "com.mohiva" %% "play-silhouette-crypto-jca" % "5.0.2",
  "com.typesafe.play" %% "play-mailer" % "6.0.1",
  "com.typesafe.play" %% "play-mailer-guice" % "6.0.1",
  "com.enragedginger" %% "akka-quartz-scheduler" % "1.6.1-akka-2.5.x",
  "com.github.nscala-time" %% "nscala-time" % "2.16.0",
  "com.beachape" %% "enumeratum" % "1.5.12",
  "com.beachape" %% "enumeratum-play" % "1.5.12",
  // async postgres
  "org.postgresql" % "postgresql" % "42.2.5",
  "com.mohiva" %% "play-silhouette-password-bcrypt" % "5.0.0",
  "com.iheart" %% "ficus" % "1.4.2",
  "net.codingwell" %% "scala-guice" % "4.1.0",
  "com.typesafe.play" %% "play-slick" % "3.0.3",
  "com.typesafe.play" %% "play-slick-evolutions" % "3.0.3",
  "com.github.tototoshi" %% "slick-joda-mapper" % "2.3.0",
  "com.github.etaty" %% "rediscala" % "1.8.0",
  "com.github.gphat" %% "censorinus" % "2.1.15",
  "org.apache.commons" % "commons-lang3" % "3.8.1"
)

includeFilter in (Assets, LessKeys.less) := "*.less"

excludeFilter in (Assets, LessKeys.less) := "_*.less"

unmanagedResourceDirectories in Assets += baseDirectory.value / "app-ui" / "app" / "components" / "templates"

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator
routesImport += "play.api.mvc.PathBindable.bindableUUID"
