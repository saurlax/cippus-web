export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  
  return await prisma.activity.update({
    where: { id },
    data: body
  })
})
