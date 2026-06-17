export const currentUser = async () => {
  // TODO: Implement actual authentication check (e.g. from cookies/JWT)
  // Returning a dummy user for now so UploadThing works.
  return { id: "user-1", role: "USER" };
};
