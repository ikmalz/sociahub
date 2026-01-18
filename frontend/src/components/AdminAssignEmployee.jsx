import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getClients, getEmployees, assignEmployeeToClient } from "../lib/api";
import {
  UserPlus,
  Users,
  Briefcase,
  Building,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  Shield
} from "lucide-react";

const AdminAssignEmployee = () => {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchClient, setSearchClient] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsData, employeesData] = await Promise.all([
          getClients(),
          getEmployees(),
        ]);

        setClients(clientsData || []);
        setEmployees(employeesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    try {
      setAssigning(true);
      await assignEmployeeToClient({
        clientId: selectedClient,
        employeeIds: selectedEmployees,
      });
      
      toast.success(
        <div className="flex items-center gap-2">
          <UserCheck className="size-5" />
          <span>Successfully assigned {selectedEmployees.length} employee(s) to client</span>
        </div>
      );
      
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error assigning employees:", error);
      toast.error("Failed to assign employees");
    } finally {
      setAssigning(false);
    }
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const getSelectedClient = () => {
    return clients.find(c => c._id === selectedClient);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.skills?.some(skill => skill.toLowerCase().includes(searchEmployee.toLowerCase()))
  );

  const filteredClients = clients.filter(client =>
    client.fullName?.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.institutionName?.toLowerCase().includes(searchClient.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="size-6 text-primary" />
                </div>
                Employee Assignment
              </h1>
              <p className="text-base-content/70">
                Assign employees to clients for project collaboration
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">Total Clients</p>
                    <p className="text-2xl font-bold">{clients.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building className="size-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">Available Employees</p>
                    <p className="text-2xl font-bold">{employees.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Users className="size-5 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">Selected for Assignment</p>
                    <p className="text-2xl font-bold">{selectedEmployees.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <UserCheck className="size-5 text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Selection */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 border border-base-300 shadow-sm sticky top-6">
              <div className="card-body p-5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="size-5 text-primary" />
                  Select Client
                </h2>

                {/* Client Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="input input-bordered w-full pl-10"
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                    />
                  </div>
                </div>

                {/* Client List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-8 opacity-50">
                      <Users className="size-8 mx-auto mb-2" />
                      <p>No clients found</p>
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <div
                        key={client._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedClient === client._id
                            ? "border-primary bg-primary/5"
                            : "border-base-300 hover:border-primary/30"
                        }`}
                        onClick={() => setSelectedClient(client._id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building className="size-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{client.fullName}</p>
                            {client.institutionName && (
                              <p className="text-sm opacity-70">{client.institutionName}</p>
                            )}
                            <p className="text-xs opacity-50">{client.email}</p>
                          </div>
                          {selectedClient === client._id && (
                            <CheckCircle className="size-5 text-success" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Selected Client Preview */}
                {selectedClient && (
                  <div className="mt-6 pt-6 border-t border-base-300">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Shield className="size-4" />
                      Selected Client
                    </h3>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building className="size-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{getSelectedClient()?.fullName}</p>
                          {getSelectedClient()?.institutionName && (
                            <p className="text-sm opacity-70">{getSelectedClient()?.institutionName}</p>
                          )}
                          <p className="text-xs opacity-50">Ready for employee assignment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Employee Selection */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Users className="size-5 text-info" />
                      Select Employees
                    </h2>
                    <p className="text-sm opacity-70">
                      Choose employees to assign to the selected client
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-primary badge-lg">
                      {selectedEmployees.length} selected
                    </div>
                    <div className="badge badge-outline badge-lg">
                      {employees.length} total
                    </div>
                  </div>
                </div>

                {/* Employee Search & Filter */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50" />
                      <input
                        type="text"
                        placeholder="Search employees by name, email, or skills..."
                        className="input input-bordered w-full pl-10"
                        value={searchEmployee}
                        onChange={(e) => setSearchEmployee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Employee List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                        <Users className="size-8 opacity-40" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
                      <p className="text-base-content/70">
                        Try adjusting your search or check if employees are available
                      </p>
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployees.includes(emp._id);
                      
                      return (
                        <div
                          key={emp._id}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-base-300 hover:border-primary/30"
                          }`}
                          onClick={() => handleEmployeeToggle(emp._id)}
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-base-300"
                            }`}>
                              {isSelected && (
                                <CheckCircle className="size-4 text-base-100" />
                              )}
                            </div>

                            {/* Avatar */}
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full bg-base-200">
                                <div className="w-full h-full flex items-center justify-center">
                                  <Briefcase className="size-5 opacity-70" />
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold">{emp.fullName}</h4>
                                  <p className="text-sm opacity-70">{emp.email}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {emp.skills?.slice(0, 3).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="badge badge-outline badge-sm"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {emp.skills && emp.skills.length > 3 && (
                                    <span className="badge badge-neutral badge-sm">
                                      +{emp.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Expertise */}
                              {emp.expertise && (
                                <div className="mt-2">
                                  <p className="text-xs opacity-70">Expertise:</p>
                                  <p className="text-sm">{emp.expertise}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-6 border-t border-base-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      {selectedEmployees.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="size-4 text-success" />
                          <span>
                            Ready to assign <strong>{selectedEmployees.length}</strong> employee(s)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm opacity-70">
                          <XCircle className="size-4" />
                          <span>No employees selected</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      className={`btn btn-primary gap-2 ${assigning ? "loading" : ""}`}
                      onClick={handleAssign}
                      disabled={!selectedClient || selectedEmployees.length === 0 || assigning}
                    >
                      {assigning ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-4" />
                          Assign {selectedEmployees.length} Employee(s)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignEmployee;