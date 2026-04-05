import {Elysia , t } from 'elysia'
import {jwt} from "@elysiajs/jwt"
import { login,logout , profile , signup } from './auth.service'
import { isAuthenticated } from './auth.guard'


const tSignup = t.Object({
    name: t.String({ minLength: 3, maxLength: 20 }),
    email: t.String({ format: "email" }), 
    password: t.String({ minLength: 6, maxLength: 50 })
})

const tLogin = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6, maxLength: 50 })
})

export type TSignUp = typeof tSignup.static;
export type TLogin = typeof tLogin.static;

export const authController = new Elysia({
  prefix: "/auth",
  name: "Auth",
})
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: process.env.JWT_EXPIRES!,
    }),
  )

  
  .macro({
    isAuthenticated,
  })

  .model({
    "auth.login": tLogin,
    "auth.signup": tSignup,
  })

  .group("", (app) =>
    app
      .post(
        "/signup",
        ({ jwt, body, cookie: { auth } }) => signup(body, auth, jwt),
        { body: "auth.signup" },
      )
      .post(
        "/login",
        ({ jwt, body, cookie: { auth } }) => login(body, auth, jwt),
        { body: "auth.login" },
      )
      .delete(
        "/logout",
        ({ cookie: { auth } }) => logout(auth),
        { isAuthenticated: ["ADMIN","USER"] },
      )
      .get(
        "/profile",
        ({ jwt, cookie: { auth } }) => profile(jwt, auth),
        { isAuthenticated: [] }, 
      ),
  )

  .listen(3000);