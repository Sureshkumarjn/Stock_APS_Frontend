import React, { useState, useEffect, useContext } from "react";
import AddStaff from "../components/AddStaff";
import AuthContext from "../AuthContext";
import UpdateStaff from "../components/UpdateStaff";
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

function Staff() {
  const [showStaffModal, setshowStaffModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStaff, setupdateStaff] = useState([]);
  const [staffs, setAllStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false); // <-- Add loading state

  const authContext = useContext(AuthContext);
  console.log("====================================");
  console.log(authContext);
  console.log("====================================");

  // Fetching Data of All Staff
  const fetchStaffData = async () => {
    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await fetch(
        `${BASE_URL}api/staff/get/${authContext.user}?page=${currentPage}&limit=${itemsPerPage}`
      );

      const data = await response.json();
      setAllStaff(data.staffs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Set loading to false after fetching data
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

  // Fetching Data of Search Staff
  const fetchSearchData = () => {
    fetch(BASE_URL + `api/staff/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStaff(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(BASE_URL + `api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Product ADD
  const addStaffModalSetting = () => {
    setshowStaffModal(!showStaffModal);
  };

  // Modal for Product UPDATE
  const updateStaffModalSetting = (selectedStaffData) => {
    console.log("Clicked: edit");
    setupdateStaff(selectedStaffData);
    setShowUpdateModal(!showUpdateModal);
  };

  // Delete item
  const deleteItem = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(BASE_URL + `api/staff/delete/${id}`)
          .then((response) => response.json())
          .then((data) => {
            setUpdatePage(!updatePage);
            Swal.fire({
              title: "Deleted!",
              text: "The Staff has been deleted.",
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
  //Export Data
  const handleExport = async () => {
    try {
      const response = await axios.get(BASE_URL + `api/staff/export-users`, {
        responseType: "blob", // Important for downloading files
      });
      const timestamp = new Date().toISOString().replace(/:/, "-"); // Generate timestamp without special characters
      const fileName = `Staff_${timestamp}.xlsx`; // Construct filename with timestamp

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

  useEffect(() => {
    fetchStaffData();
    fetchSalesData();
  }, [updatePage, currentPage]);

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showStaffModal && (
          <AddStaff
            addStaffModalSetting={addStaffModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateStaff
            updateStaffData={updateStaff}
            updateModalSetting={updateStaffModalSetting}
          />
        )}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Staff List</span>
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
                onClick={addStaffModalSetting}
              >
                Add Staff
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
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700">Loading staffs...</p>
            </div>
          ) : staffs.length === 0 ? (
            <div className="flex flex-col justify-center items-center bg-gray-50 mt-10 py-10">
              <img src={require("../assets/noproduct1.png")} alt="" />
              <p className="text-gray-500 mt-4 text-lg">No staffs found</p>
            </div>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Staff Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    No Of Day Working
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Fesivel Holiday
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    OT Hours
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    PER Day Wages
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Salary To Be
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    PER Hour
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">OT</th>
                  <th className="px-6 py-3 text-left font-semibold">Month</th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Total Salary
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Food Advance
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Balance E-Pay
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Remark</th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {staffs.map((element, index) => {
                  return (
                    <tr
                      key={element._id}
                      className="hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-6 py-4 text-gray-900">
                        {element.sname}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.nodwork}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.festivelh}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.totaldays}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.otdays}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.wages}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.salarytobe}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.perhour}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{element.ot}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.month}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.totalsalary}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.foodadv}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.balanceepay}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.remark}
                      </td>
                      {/* <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.stock > 0 ? "In Stock" : "Not in Stock"}
                    </td> */}
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <span
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          onClick={() => updateStaffModalSetting(element)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </span>
                        <span
                          className="text-red-600 hover:text-red-800 cursor-pointer"
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

export default Staff;
