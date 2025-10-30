export default defineEventHandler(async () => {
  return await prisma.user.findMany({
    orderBy: { id: 'asc' }
  })
})
