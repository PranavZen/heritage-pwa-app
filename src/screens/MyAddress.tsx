import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import axios from "axios";
import { notification, Modal } from "antd";
import { setShouldRefresh } from "../store/slices/cartSlice";
import { useSelector } from "react-redux";
import { RootState } from '../store';
import "../scss/_myAddress.enhanced.scss";

export const MyAddress: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', addresses);
  const [newAddress, setNewAddress] = useState<any | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const [shouldRefresh, setShouldRefresh] = useState(false);

  // console.log("shouldRefresh", shouldRefresh)

  const c_id = localStorage.getItem("c_id");

  useEffect(() => {
    const fetchAddresses = async () => {
      const formData = new FormData();
      formData.append("c_id", c_id || "0");

      try {
        setLoading(true);
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getAllAddressById",
          formData
        );
        setAddresses(response.data.addresses);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching addresses:", error);
      }
    };

    if (shouldRefresh) {
      fetchAddresses();
      setShouldRefresh(false);
    } else {
      fetchAddresses();
    }
  }, [c_id, shouldRefresh]);


  // *******************************Delete*************************************
  useEffect(() => {
    if (deleteAddressId !== null) {
      const deleteAddress = async () => {
        const formData = new FormData();
        formData.append("c_id", c_id || "null");
        formData.append("address_id", deleteAddressId.toString());
        try {
          setLoading(true);
          const response = await axios.post(
            "https://heritage.bizdel.in/app/consumer/services_v11/deleteAddress",
            formData
          );

          if (response.data.status === "fail") {
            notification.error({
              message: "Delete Failed",
              description: response.data.message,
              duration: 3,
            });
          } else {
            setAddresses((prevAddresses) =>
              prevAddresses.filter((addr) => addr.id !== deleteAddressId)
            );
            notification.success({
              message: "Address Deleted",
              description: "The address has been deleted successfully.",
              duration: 3,
            });
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error deleting address:", error);
          notification.error({
            message: "Error",
            description: "There was an error deleting the address.",
            duration: 3,
          });
        }
      };
      deleteAddress();
    }
  }, [deleteAddressId, c_id]);

  const confirmDelete = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this address?",
      content: "This action cannot be undone.",
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",
      className: "delete-modal",
      centered: true,
      onOk: () => {
        setDeleteAddressId(id);
      },
      onCancel: () => {
        // console.log("Delete canceled");
      },
    });
  };

  const movetoAddressAddPage = () => {
    const c_id = localStorage.getItem('c_id');

    if (!c_id) {
      Modal.info({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        okText: 'Sign In',
        className: 'sign-in-modal',
        centered: true,
        onOk() {
          navigate('/');
        },
      });
      return;
    }
    navigate(Routes.AddressAdd);
  };

  const handleToggle = (id: number) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      const idStr = id.toString();
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const handleNewAddressAdd = (newAddressData: any) => {
    setNewAddress(newAddressData);
    setAddresses((prev) => [newAddressData, ...prev]);
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="My Addresses" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;


    const SetDefaultAddress = async (elem: any) => {
      const formData = new FormData();
      formData.append("address_id", elem.id || "");
      formData.append("c_id", elem.c_id);
      formData.append("country_id", elem.country_id);
      formData.append("state_id", elem.state_id);
      formData.append("city_id", elem.city_id);
      formData.append("area_id", localStorage.getItem('area_id') || '');
      formData.append("address1", elem.address1);
      formData.append("address2", elem.address2);
      formData.append("pincode", elem.pincode);
      formData.append("is_default", "1");
      formData.append("firstname", elem.firstname);
      formData.append("lastname", elem.lastname);
      formData.append("building_name", elem.building_name);

      if (elem.building_id) {
        formData.append("building_id", elem.building_id);
      }

      try {
        setLoading(true);
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/updateAddress",
          formData
        );

        if (response.data.status === "success") {
          navigate(Routes.MyAddress);
          notification.success({ message: "Address set as default" });
          setShouldRefresh(true);
        } else {

          notification.error({ message: response.data.message });
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error updating address:", error);
      }
    };


    return (
      <section className="scrollable">
        <div className="newAddressBtnWrap">
          <button onClick={movetoAddressAddPage} className="newAddressBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Address
          </button>
        </div>

        {/* Display existing addresses in a separate div if more than one address */}
        <div className="editAddressBoxWrap">
          <h3>Existing Addresses</h3>
          {addresses?.length > 0 ? (
            <div className="myAddressBoxWrap">
              {addresses.map((elem) => (
                <div className="myaddress-getting-separate" key={elem.id}>
                  <h4>{elem.firstname} {elem.lastname}</h4>
                  <p>{elem.flat_plot_no} {elem.wing} {elem.building_name} {elem.address1} {elem.address2}, {elem.area_name}, {elem.city_name}, {elem.state_name} {elem.pincode}</p>
                  <div className="myAddressActionBtnWrap">
                    <span
                      onClick={() => navigate(Routes.AddressAdd, { state: { cityID: elem } })}
                      className="editBtn btns"
                      aria-label="Edit address"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </span>
                    <span
                      onClick={() => confirmDelete(elem.id)}
                      className="deleteBtn btns"
                      aria-label="Delete address"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </span>
                    {elem.is_default === "1" ? (
                      <span className="defaultAddressLabel">Default Address</span>
                    ) : (
                      <span
                        onClick={() => SetDefaultAddress(elem)}
                        className="defaultAddressLabel rmvMark"
                        aria-label="Set as default address"
                      >
                        Set as Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No addresses found. Please add a new address.</p>
            </div>
          )}

        </div>

      </section>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};