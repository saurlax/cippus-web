export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  return await prisma.user.update({
    where: { id },
    data: {
      username: body.username,
      password: await hashPassword(body.password),
      name: body.name,
      email: body.email,
      gender: body.gender,
      college: body.college,
      admin: body.admin,
    },
  });
});
