import Layout from "./Layout";

const AdminLayout = ({ children }) => {
  return (
    <Layout showSidebar={true} adminLayout={true}>
      {children}
    </Layout>
  );
};

export default AdminLayout;