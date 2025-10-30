export default defineEventHandler(async () => {
  return await prisma.activity.findMany({
    orderBy: { id: 'desc' }
  })
})
