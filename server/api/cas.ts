export default defineEventHandler(async (event) => {
  const { casBaseUrl, casService } = useAppConfig();
  const { ticket } = getQuery(event);
  const rawXml = await $fetch<string>(
    `${casBaseUrl}/serviceValidate?service=${casService}&ticket=${ticket}`
  );
  const username = rawXml.match(/<cas:ID_NUMBER>(\d+)<\/cas:ID_NUMBER>/)?.[1];
  const name = rawXml.match(/<cas:USER_NAME>([^<]+)<\/cas:USER_NAME>/)?.[1];
  if (username) {
    await setUserSession(event, { user: { username } });
    return sendRedirect(event, "/");
  }
  sendRedirect(event, "/login");
});
