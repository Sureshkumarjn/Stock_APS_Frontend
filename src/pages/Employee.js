import React, { useState, useEffect, useContext } from "react";
import AddEmployee from "../components/AddEmployee";
import UpdateEmployee from "../components/UpdateEmp";
import AuthContext from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // Import SweetAlert

function Employee() {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateEmployee, setUpdateEmployee] = useState([]);
  const [employees, setAllEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const navigate = useNavigate();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false); // <-- Add loading state

  const authContext = useContext(AuthContext);
  console.log("====================================");
  console.log(authContext);
  console.log("====================================");

  useEffect(() => {
    fetchEmployeesData();
    fetchSalesData();
  }, [updatePage]);

  // Fetching Data of All Employee
  const fetchEmployeesData = async () => {
    setLoading(true); // Show loader
    try {
      const response = await fetch(
        `${BASE_URL}api/employee/get/${authContext.user}?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      setAllEmployees(data.employees);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Hide loader when done
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fetching Data of Search Employee
  const fetchSearchData = () => {
    fetch(BASE_URL + `api/employee/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllEmployees(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(BASE_URL + `api/store/get/${authContext.user}`)
      .then((res) => res.json()) // Use 'res' instead of 'response'
      .then((data) => {
        setAllStores(data); // Use 'data' directly
      })
      .catch((error) => console.error("Error fetching stores:", error)); // Add error handling
  };

  // Modal for Employee ADD
  const addEmployeeModalSetting = () => {
    setShowEmployeeModal(!showEmployeeModal);
  };

  // Modal for Employee UPDATE
  const updateEmployeeModalSetting = (selectedEmployeeData) => {
    console.log("Clicked: edit");
    setUpdateEmployee(selectedEmployeeData);
    setShowUpdateModal(!showUpdateModal);
  };

  // Delete item
  const deleteItem = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the delete function here
        fetch(BASE_URL + `api/employee/delete/${id}`)
          .then((response) => response.json())
          .then((data) => {
            setUpdatePage(!updatePage);
            Swal.fire({
              title: "Deleted!",
              text: "The product has been deleted.",
              icon: "success",
              confirmButtonText: "OK",
              confirmButtonColor: "#3085d6",
            });
          })
          .catch((err) => {
            Swal.fire({
              title: "Error!",
              text: "There was an error deleting the product.",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#d33",
            });
          });
      }
    });
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
    fetchSearchData();
  };
  const handleExport = async () => {
    try {
      const response = await axios.get(BASE_URL + `api/employee/export-users`, {
        responseType: "blob", // Important for downloading files
      });
      const timestamp = new Date().toISOString().replace(/:/, "-"); // Generate timestamp without special characters
      const fileName = `Stock_${timestamp}.xlsx`; // Construct filename with timestamp

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };
  //Active Employee
  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await axios.put(BASE_URL + `api/employee/${employeeId}`, {
        status: newStatus,
      });
      // Update the local state after successful update

      const updatedEmployees = employees.map((emp) =>
        emp._id === employeeId ? { ...emp, status: newStatus } : emp
      );
      setAllEmployees(updatedEmployees);
      navigate(0);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
    fetchSalesData();
  }, [updatePage, currentPage]); // Add currentPage here

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showEmployeeModal && (
          <AddEmployee
            addEmployeeModalSetting={addEmployeeModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateEmployee
            updateEmployeeData={updateEmployee}
            updateModalSetting={updateEmployeeModalSetting}
          />
        )}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Employee List</span>
              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
                <img
                  alt="search-icon"
                  className="w-5 h-5"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  className="border-none outline-none focus:border-none text-xs"
                  type="text"
                  placeholder="Search Supplier Name"
                  value={searchTerm}
                  onChange={handleSearchTerm}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addEmployeeModalSetting}
              >
                Add Employee
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={handleExport}
              >
                Export
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="w-10 h-10 bg-blue-500 animate-ping rounded-lg"></div>
            </div>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Employee Number
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Employee Name
                  </th>

                  <th className="px-6 py-3 text-left font-semibold">
                    Employee Category
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Change Active
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((element, index) => {
                  return (
                    <tr
                      key={element._id}
                      className="hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-6 py-4 text-gray-900">
                        {element.empnumber}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.empname}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.empcategory}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.status}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white me-3 font-bold p-2 text-xs  rounded px-4 py-2 text-center"
                          onClick={() =>
                            handleStatusChange(
                              element._id,
                              element.status === "Active"
                                ? "Inactive"
                                : "Active"
                            )
                          }
                        >
                          {element.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>

                      {/* <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.stock > 0 ? "In Stock" : "Not in Stock"}
                    </td> */}
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        <span
                          className="text-green-700 cursor-pointer"
                          onClick={() => updateEmployeeModalSetting(element)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </span>
                        <span
                          className="text-red-600 px-2 cursor-pointer"
                          onClick={() => deleteItem(element._id)}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {/* Pagination */}

          <div className="flex justify-between items-center p-4">
            <button
              className={`px-4 py-2 rounded bg-gray-300 ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-400"
              }`}
              disabled={currentPage === 1}
              onClick={prevPage}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Previous
            </button>
            <span className="font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded bg-gray-300 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-400"
              }`}
              disabled={currentPage === totalPages}
              onClick={nextPage}
            >
              Next <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employee;
