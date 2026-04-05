import { t } from "elysia";
import { PostStatus } from "@prisma/client";

export type PostStatusType = PostStatus;

const basePostFields = {
  title: t.String({ minLength: 3 }),
  slug: t.String({ minLength: 3 }),
  cover: t.String(),
  description: t.String({ minLength: 10 }),
  keywords: t.String(),
  status: t.Enum(PostStatus),

  content: t.String({ minLength: 10 }),
  tags: t.Array(t.String()),
  userId: t.Integer(),
};

const create = t.Object(basePostFields);

const update = t.Partial(
  t.Object({
    ...basePostFields,
    viewCount: t.Number(),
  })
);

const query = t.Object({
  limit: t.Optional(t.Number({ default: 10, minimum: 1, maximum: 100 })),
  cursor: t.Optional(t.String()),
  search: t.Optional(t.String()),
  userId: t.Optional(t.Numeric()),
  include: t.Optional(t.String()),

  sortBy: t.Optional(
    t.Union([t.Literal("createdAt"), t.Literal("viewCount")])
  ),

  sortOrder: t.Optional(
    t.Union([t.Literal("asc"), t.Literal("desc")])
  ),
});

export type TCreatePost = typeof create.static;
export type TUpdatePost = typeof update.static;
export type TQueryPosts = typeof query.static;

export const PostsModel = {
  "posts.create": create,
  "posts.update": update,
  "posts.query": query,
};