export const getVisibleRoles = (currentRole) => {
  switch (currentRole) {
    case "employee":
      return ["client"];
    case "client":
      return ["employee"];
    case "admin":
      return ["client", "employee", "admin"];
    default:
      return [];
  }
};
