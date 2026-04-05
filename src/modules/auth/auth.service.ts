import { TSignUp , TLogin } from "./auth.controller";
import { User } from "@prisma/client";
import { GlobalError } from "../../lib/errors";
import { Prisma } from "../../../prisma/client";

async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername.toLowerCase().replace(/\s+/g, "");

  const existingUser = await Prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    username = `${username}_${Date.now()}`;
    return generateUniqueUsername(username);
  }

  return username;
}

export async function signup(
  body: TSignUp,
  auth: Record<string, any>,
  jwt: Record<string, any>
) {
  const { email, name, password } = body;

  const existingUser = await Prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new GlobalError("User already exists", 400);

  const baseUsername = name.split(" ").join("");
  const username = await generateUniqueUsername(baseUsername);

  const hashedPassword = await Bun.password.hash(password);

  const user = await Prisma.user.create({
    data: { name, email, username, password: hashedPassword },
  });

  const token = await jwt.sign({ id: user.id, email: user.email });

  auth.set({
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    auth,
    token,
    user: { id: user.id, name: user.name, username: user.username, email: user.email },
  };
}

export async function login(
  body: TLogin,
  auth: Record<string, any>,
  jwt: Record<string, any>
) {
  const { email, password } = body;

  const user = await Prisma.user.findUnique({ where: { email } });
  if (!user) throw new GlobalError("User not found", 400);

  const validPassword = await Bun.password.verify(password, user.password);
  if (!validPassword) throw new GlobalError("Invalid password", 400);

  const token = await jwt.sign({ id: user.id, email: user.email });

  auth.set({
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    token,
    user: { id: user.id, name: user.name, username: user.username, email: user.email },
  };
}

export async function logout(auth: Record<string, any>) {
  auth.remove();
}

export async function profile(auth: Record<string, any>, jwt: Record<string, any>) {
  if (!auth.value) throw new GlobalError("Unauthorized", 401);

  const payload = await jwt.verify(auth.value);
  if (!payload) throw new GlobalError("Unauthorized", 401);

  const user = await Prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new GlobalError("User not found", 400);

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
  };
}