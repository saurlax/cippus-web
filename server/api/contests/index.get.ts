export default defineEventHandler(async () => {
  return await prisma.contest.findMany({
    orderBy: { createdAt: 'desc' }
  })
})
