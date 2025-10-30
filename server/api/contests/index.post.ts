export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  return await prisma.contest.create({
    data: {
      title: body.title,
      description: body.description
    }
  })
})
