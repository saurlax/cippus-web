export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  return await prisma.user.findUnique({
    where: { username },
  });
});
