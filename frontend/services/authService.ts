/* begin authService.ts */

import { client } from "@/client";

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await client.POST("/users/login", {
      body: { userName: null, email, password },
    });

    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

/* end authService.ts */