import { db, schema } from "@nuxthub/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await db
    .insert(schema.awardTypes)
    .values({
      name: body.name,
    })
    .returning();
});
