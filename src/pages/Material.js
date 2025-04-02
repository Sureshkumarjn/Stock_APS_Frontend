import React, { useState, useEffect, useContext } from "react";
import AddMaterial from "../components/AddMaterial";
import AuthContext from "../AuthContext";
import UpdateMaterial from "../components/UpdateMaterial";
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

function Material() {
  const [showMaterialModal, setshowMaterialModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMaterial, setupdateMaterial] = useState([]);
  const [Material, setAllMaterial] = useState([]);
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

  // Fetching Data of All Material
  const fetchMaterialData = async () => {
    setLoading(true); // <-- Show loader
    try {
      const response = await fetch(
        `${BASE_URL}api/material/get/${authContext.user}?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      setAllMaterial(data.materials);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.log(err);
    }
    setLoading(false); // <-- Hide loader
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

  // Fetching Data of Search Material
  const fetchSearchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}api/material/search?searchTerm=${searchTerm}`
      );
      const data = await response.json();
      setAllMaterial(data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
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
  const addMaterialModalSetting = () => {
    setshowMaterialModal(!showMaterialModal);
  };

  // Modal for Product UPDATE
  const updateMaterialModalSetting = (selectedMaterialData) => {
    console.log("Clicked: edit");
    setupdateMaterial(selectedMaterialData);
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
        fetch(BASE_URL + `api/material/delete/${id}`)
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
  //Export Data
  const handleExport = async () => {
    try {
      const response = await axios.get(BASE_URL + `api/material/export-users`, {
        responseType: "blob", // Important for downloading files
      });
      const timestamp = new Date().toISOString().replace(/:/, "-"); // Generate timestamp without special characters
      const fileName = `Material_${timestamp}.xlsx`; // Construct filename with timestamp

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
    fetchMaterialData();
    fetchSalesData();
  }, [updatePage, currentPage]); // Add currentPage here

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showMaterialModal && (
          <AddMaterial
            addMaterialModalSetting={addMaterialModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateMaterial
            updateMaterialData={updateMaterial}
            updateModalSetting={updateMaterialModalSetting}
          />
        )}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3 mb-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Raw Material List</span>
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
                onClick={addMaterialModalSetting}
              >
                Add Material
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={handleExport}
              >
                Export
              </button>
            </div>
          </div>
          {/* Show Loader if Loading */}
          {loading ? (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="w-8 h-8 bg-blue-500 animate-ping rounded-lg"></div>
            </div>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Supplier Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Material Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Size</th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Thickness
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Length</th>
                  <th className="px-6 py-3 text-left font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Units</th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {Material.map((element, index) => {
                  return (
                    <tr
                      key={element._id}
                      className="hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-6 py-4 text-gray-900">
                        {element.name}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.mname}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.size}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.thickness}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.length}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.stock}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.cstock}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.quantity}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {element.units}
                      </td>
                      {/* <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.stock > 0 ? "In Stock" : "Not in Stock"}
                    </td> */}
                      <td className="px-6 py-4 text-gray-900">
                        <span
                          className="text-green-700 cursor-pointer"
                          onClick={() => updateMaterialModalSetting(element)}
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

export default Material;
