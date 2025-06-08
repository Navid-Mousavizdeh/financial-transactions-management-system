import jsonServer from "json-server";
import delayMiddleware from "./middleware";
import { config } from "./config";
import path from "path";

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(delayMiddleware);
server.use(router);

server.listen(config.port, () => {
  console.log(`JSON Server running at http://localhost:${config.port}`);
});
