export default defineNuxtRouteMiddleware((to) => {
  const publicPaths = ["/", "/login", "/notices", "/contests"];
  const isPublicPath = publicPaths.some(
    (path) => to.path === path || to.path.startsWith(`${path}/`),
  );

  if (isPublicPath) {
    return;
  }

  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }
});