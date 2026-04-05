import { Prisma } from "../../../prisma/client";
import { TCreatePost, TQueryPosts, TUpdatePost } from "./post.guard";



export class PostsService {
  async create(data: TCreatePost, userId: number) {
    return  Prisma.post.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: number, data: TUpdatePost) {
    return Prisma.post.update({
      where: { id },
      data,
    });
  }

  async findAll(query: TQueryPosts) {
    const {
      limit = 10,
      cursor,
      search,
      userId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const take = Number(limit) || 10;

    const where: any = {};

    if (userId) {
      where.userId = Number(userId);
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // 🔹 cursor pagination
    const pagination: any = {};
    if (cursor) {
      pagination.cursor = { id: Number(cursor) };
      pagination.skip = 1; 
    }

    // 🔹 sorting
    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    // 🔹 query
    const [posts, total] = await Promise.all([
      Prisma.post.findMany({
        where,
        take,
        ...pagination,
        orderBy,
      }),
      Prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        limit: take,
        nextCursor:
          posts.length === take ? posts[posts.length - 1].id : null,
        search: search || null,
        userId: userId || null,
        sortBy,
        sortOrder,
      },
    };
  }

  async findOne(id: number) {
    return Prisma.post.findUnique({
      where: { id },
    });
  }

  async delete(id: number) {
    return Prisma.post.delete({
      where: { id },
    });
  }
}