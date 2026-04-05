import { Prisma } from "../../../prisma/client";
import { GlobalError } from "../../lib/errors";

type Role = "USER" | "ADMIN";

export function isAuthenticated(roles: Role[] = []) {
  return {
    async beforeHandle({ cookie, jwt, store }: any) {
      const token = cookie.auth?.value;

      if (!token) {
        throw new GlobalError("Unauthorized", 401);
      }

      let payload: any;

      try {
        payload = await jwt.verify(token);
      } catch {
        throw new GlobalError("Invalid token", 401);
      }

      if (!payload?.email) {
        throw new GlobalError("Invalid token payload", 401);
      }

      const user = await Prisma.user.findUnique({
        where: { email: payload.email },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new GlobalError("User not found", 404);
      }

      if (roles.length === 0) {
        store.user = user;
        return;
      }

      if (roles.includes("USER") && roles.includes("ADMIN")) {
        store.user = user;
        return;
      }

      if (!roles.includes(user.role)) {
        throw new GlobalError("Forbidden", 403);
      }

      store.user = user;
    },
  };
}