export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  
  return await prisma.notice.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      category: body.category
    }
  })
})
