import Elysia from "elysia";
import cors from "@elysiajs/cors";
import {elysiaXSS} from "elysia-xss";
import { globalErrors} from "./lib/errors";
import { authController } from "./modules/auth/auth.controller";


const app = new Elysia()
  
  .use(elysiaXSS())
  .onError(globalErrors)
  .state("user", {})
  .use(authController)
  .listen(3000)

  console.log(`Server running at http://localhost:3000`);