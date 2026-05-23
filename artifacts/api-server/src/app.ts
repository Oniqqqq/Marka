import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const localSiteDir = path.resolve(process.cwd(), "../../local-site");

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use("/store77", express.static(localSiteDir, { dotfiles: "allow" }));
app.get("/store77", (_req, res) => res.redirect("/store77/catalogue.html"));

const uploadDir = path.join(localSiteDir, "assets/store77.net/upload");
app.use("/upload", express.static(uploadDir, { dotfiles: "allow" }));

export default app;
