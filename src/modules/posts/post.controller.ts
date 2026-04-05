import { Elysia, t } from "elysia";
import { isAuthenticated } from "../auth/auth.guard";
import { PostsService } from "./post.service";
import { PostsModel } from "./post.guard";

const posts = new PostsService();

export const postsController = new Elysia({
  prefix: "/posts",
  name: "Posts",
})
  .macro({
    isAuthenticated,
  })
  .model(PostsModel)

  // 🔹 GET ALL
  .get(
    "/",
    async ({ query }) => {
      return await posts.findAll(query);
    },
    {
      query: "posts.query",
    },
  )

  // 🔹 GET ONE
  .get(
    "/:id",
    async ({ params, set }) => {
      const post = await posts.findOne(Number(params.id));

      if (!post) {
        set.status = 404;
        return { message: "Post not found" };
      }

      return post;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 🔹 CREATE
  .post(
    "/",
    async ({ body, store }) => {
      const user = (store as any).user;

      return await posts.create(body, user.id);
    },
    {
      body: "posts.create",
      isAuthenticated: ["USER","ADMIN"],
    },
  )

  // 🔹 UPDATE
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const id = Number(params.id);

      const exists = await posts.findOne(id);
      if (!exists) {
        set.status = 404;
        return { message: "Post not found" };
      }

      return await posts.update(id, body);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: "posts.update",
      isAuthenticated: ["USER","ADMIN"],
    },
  )

  // 🔹 DELETE
  .delete(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);

      const exists = await posts.findOne(id);
      if (!exists) {
        set.status = 404;
        return { message: "Post not found" };
      }

      await posts.delete(id);

      return { message: "Post deleted successfully" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      isAuthenticated: ["ADMIN","USER"],
    },
  );