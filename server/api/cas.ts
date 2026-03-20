import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const { public: config } = useRuntimeConfig();
  const { ticket } = getQuery(event);
  const rawXml = await $fetch<string>(
    `${config.casBaseUrl}/serviceValidate?service=${config.casServiceUrl}&ticket=${ticket}`
  );
  const username = rawXml.match(/<cas:ID_NUMBER>(\d+)<\/cas:ID_NUMBER>/)?.[1];
  const name = rawXml.match(/<cas:USER_NAME>([^<]+)<\/cas:USER_NAME>/)?.[1];

  if (username) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
    const sessionName = name ?? user?.name ?? null;
    const sessionAdmin = user?.admin ?? false;

    if (!user) {
      await db.insert(schema.users).values({ username, name: name ?? null });
    }

    await setUserSession(event, {
      user: { username, name: sessionName, admin: sessionAdmin },
    });
    return sendRedirect(event, "/");
  }

  sendRedirect(event, "/login");
});
