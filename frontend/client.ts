import createClient from "openapi-fetch";
import type { paths } from "schema/openapi-types";
import { env } from "config/env";

const API_BASE_URL = `http://${env.HOST_FROM_EXPO}:5112`;
//console.error(API_BASE_URL);


export const client = createClient<paths>({ baseUrl: API_BASE_URL });