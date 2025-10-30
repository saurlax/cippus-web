export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  
  return await prisma.user.delete({
    where: { id }
  })
})
