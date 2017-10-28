
# My Chat Application

A simple chat web application with Play Framework, ReactJS and Redis using web sockets.

### How to run the application

1. Make sure you have Redis installed and running.
2. Install the npm modules using `npm install`.
3. Open a terminal and run Webpack using the `webpack` command.
4. Open another terminal and start the Play! application using `sbt run`.
5. Go to `http://localhost:9000`.

### Extra steps in order to build the project

The Redis client library used by this project (scredis) has not yet published a version to Maven central that is compatible with Scala 2.12. In order to build the project you will need to clone the [scredis](https://github.com/scredis/scredis) repo and execute `sbt publishLocal`.
