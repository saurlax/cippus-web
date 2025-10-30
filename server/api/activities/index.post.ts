export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  return await prisma.activity.create({
    data: body
  })
})
