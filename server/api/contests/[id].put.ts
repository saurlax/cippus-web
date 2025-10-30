export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  
  return await prisma.contest.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description
    }
  })
})
