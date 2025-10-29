export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  return await prisma.notice.create({
    data: {
      title: body.title,
      content: body.content,
      category: body.category
    }
  })
})
