import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const { casBaseUrl, casServiceUrl } = useAppConfig();
  const { ticket } = getQuery(event);
  const supabase = serverSupabaseServiceRole(event);

  // const rawXml = await $fetch<string>(
  //   `${casBaseUrl}/serviceValidate?service=${casServiceUrl}&ticket=${ticket}`,
  // );
  // const id_number = rawXml.match(/<cas:ID_NUMBER>(\d+)<\/cas:ID_NUMBER>/)?.[1];

  // if (!id_number) {
  //   throw createError({ statusCode: 400, statusMessage: "Invalid CAS ticket" });
  // }

  // const email = `${id_number}@id.internal`;

  // let { data: user } = await supabase
  //   .from("profiles")
  //   .select("id")
  //   .eq("id_number", id_number)
  //   .single();

  // if (!user) {
  //   const { data } = await supabase.auth.admin.createUser({
  //     email,
  //   });
  //   user = data.user!;
  //   await supabase.from("profiles").insert({
  //     id: user.id,
  //     id_number,
  //     name: rawXml.match(/<cas:USER_NAME>([^<]+)<\/cas:USER_NAME>/)?.[1],
  //   });
  // }

  // const { data } = await supabase.auth.admin.generateLink({
  //   type: "magiclink",
  //   email,
  // });
  // const action_link = data.properties?.action_link;
  // if (action_link) {
  //   sendRedirect(event, action_link);
  // } else {
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: "Failed to generate magic link",
  //   });
  // }

  const { data } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: "20232241392@id.internal",
  });
  const action_link = data.properties?.action_link;
  return action_link;
  // sendRedirect(event, action_link!);
});
