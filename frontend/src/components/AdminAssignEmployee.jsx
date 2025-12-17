import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getClients, getEmployees, assignEmployeeToClient } from "../lib/api";

const AdminAssignEmployee = () => {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, employeesData] = await Promise.all([
          getClients(),
          getEmployees(),
        ]);

        setClients(clientsData || []);
        setEmployees(employeesData || []);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    await assignEmployeeToClient({
      clientId: selectedClient,
      employeeIds: selectedEmployees,
    });
    toast.success("Employee assigned to client");
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6 space-y-4">
      <h2 className="text-xl font-bold">Assign Employee to Client</h2>

      {/* Client */}
      <select
        className="select select-bordered w-full"
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">Select Client</option>
        {clients.map((c) => (
          <option key={c._id} value={c._id}>
            {c.fullName}
          </option>
        ))}
      </select>

      {/* Employees */}
      <div className="grid grid-cols-2 gap-2">
        {Array.isArray(employees) &&
          employees.map((emp) => (
            <label key={emp._id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="checkbox"
                value={emp._id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEmployees((prev) => [...prev, emp._id]);
                  } else {
                    setSelectedEmployees((prev) =>
                      prev.filter((id) => id !== emp._id)
                    );
                  }
                }}
              />
              {emp.fullName}
            </label>
          ))}
      </div>

      <button className="btn btn-primary" onClick={handleAssign}>
        Save Assignment
      </button>
    </div>
  );
};

export default AdminAssignEmployee;
