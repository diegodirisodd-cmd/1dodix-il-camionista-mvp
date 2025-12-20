import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    provider: "sqlite",
    url: "file:./dev.db",
  },
});
