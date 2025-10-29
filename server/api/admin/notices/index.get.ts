export default defineEventHandler(async () => {
  return await prisma.notice.findMany({
    orderBy: { createdAt: 'desc' }
  })
})
