export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  return await prisma.activity.create({
    data: {
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate)
    }
  })
})
