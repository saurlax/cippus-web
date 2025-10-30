export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await prisma.user.create({
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
