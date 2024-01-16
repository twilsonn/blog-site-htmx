import express from "express";
import { engine } from "express-handlebars";
import { JSONFilePreset } from "lowdb/node";
import path from "node:path";
import livereload from "livereload";
import connectLivereload from "connect-livereload";

const __dirname = path.resolve();

const app = express();
const port = 3000;

// start local database
const db = await JSONFilePreset("db.json", { posts: [] });

// update express global request type
declare global {
  namespace Express {
    interface Request {
      db: typeof db;
    }
  }
}

const liveReloadServer = livereload.createServer();

liveReloadServer.watch(path.join(__dirname, "public"));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(connectLivereload());

// add database instance to request
app.use((req, _res, next) => {
  req.db = db;
  next();
});

// setup handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.set("views", path.join(__dirname, "views"));

// setup static folder
app.use("/static", express.static("public"));

// routes
app.get("/", (req, res) => {
  res.render("index");
});

// start the server
app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});
