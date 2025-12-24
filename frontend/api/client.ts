import createClient from "openapi-fetch";
import type { paths } from "@/api/schema/openapi-types";
import { env } from "config/env";

export const client = createClient<paths>({ baseUrl: env.API_BASE_URL });
