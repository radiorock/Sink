export default eventHandler(async (event) => {
  const context = await getOperatorContext(event)
  return {
    username: context.username,
    name: context.name,
    role: context.role,
    ip: context.ip,
  }
})
