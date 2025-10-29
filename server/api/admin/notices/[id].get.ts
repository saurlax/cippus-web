export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  
  return await prisma.notice.findUnique({
    where: { id }
  })
})
