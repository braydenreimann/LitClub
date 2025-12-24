// env.ts

const apiEnv = process.env.EXPO_PUBLIC_API_ENV === "prod" ? "prod" : "dev";

const devApiBaseUrl =
  process.env.EXPO_PUBLIC_DEV_API_BASE_URL ?? "http://192.168.1.140:5112";

const prodApiBaseUrl =
  process.env.EXPO_PUBLIC_PROD_API_BASE_URL ??
  "https://litclub-api-f5gtf4cnfbejh2fb.centralus-01.azurewebsites.net";

export const env = {
  API_ENV: apiEnv,
  DEV_API_BASE_URL: devApiBaseUrl,
  PROD_API_BASE_URL: prodApiBaseUrl,
  API_BASE_URL: apiEnv === "prod" ? prodApiBaseUrl : devApiBaseUrl,
};