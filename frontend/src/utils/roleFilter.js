export const getVisibleRoles = (userRole) => {
  switch (userRole) {
    case "admin":
      return ["admin", "employee", "client", "unassigned"];
    case "employee":
      return ["employee", "client"]; 
    case "client":
      return ["employee"]; 
    default:
      return [];
  }
};