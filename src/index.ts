import {Elysia} from "elysia";
import cors from "@elysiajs/cors";
import {elysiaXSS} from "elysia-xss";
import {globalErrors} from "./lib/errors";
import {authController} from "./modules/auth/auth.controller";
import {postsController} from "./modules/posts/post.controller";

const app = new Elysia()
    .use(cors({
        origin: process.env.NODE_ENV === "development" ? true : process.env.BASE_URL,
        methods: ["GET", "POST", "DELETE", "PATCH"],
    }))
    .onError(globalErrors)
    .state("user", {})
    .use(elysiaXSS({}))
    .use(authController)
    .use(postsController)
    .listen(process.env.PORT ?? 3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
