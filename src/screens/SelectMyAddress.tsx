import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { Routes, TabScreens } from "../routes";
import { components } from "../components";
import axios from "axios";
import { notification, Modal } from "antd";
import { useLocation } from "react-router-dom";
import { setScreen } from "../store/slices/tabSlice";

export const SelectMyAddress: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();
  const { id } = location.state || {};

  // console.log("iddddddddddddddd", id);

  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState<any | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  // console.log("selectedAddressIdddddd", selectedAddressId);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const c_id = localStorage.getItem("c_id");

  useEffect(() => {
    if (id) {
      setSelectedAddressId(id);
    }
  }, [id]);

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
    fetchAddresses();
  }, [c_id]);

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
      onOk: () => {
        setDeleteAddressId(id);
      },
    });
  };

  const movetoAddressAddPage = () => {
    const c_id = localStorage.getItem("c_id");
    if (!c_id) {
      Modal.info({
        title: "Please Sign In",
        content: "You need to sign in to add items to your cart.",
        onOk() {
          navigate("/");
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
      newSet.has(idStr) ? newSet.delete(idStr) : newSet.add(idStr);
      return newSet;
    });
  };

  const handleNewAddressAdd = (newAddressData: any) => {
    setNewAddress(newAddressData);
    setAddresses((prev) => [newAddressData, ...prev]);
  };

  const handleCheckboxChange = (addressId: number) => {
    setSelectedAddressId(addressId);
    localStorage.setItem("selected_address_id", addressId.toString());
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Select Address" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;

    return (
      <section className="scrollable">
        <div className="newAddressBtnWrap">
          <button onClick={movetoAddressAddPage} className="newAddressBtn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>{" "}
            New Address
          </button>
        </div>

        <div className="editAddressBoxWrap">
          <h3>Existing Addresses</h3>
          {addresses?.length > 0 ? (
            <div className="myAddressBoxWrap">
              {addresses.map((elem) => (
                <div
                  className="myaddress-getting-separate"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    localStorage.setItem("selectedAddressId", elem.id);
                    dispatch(setScreen(TabScreens.Order));
                    navigate(Routes.TabNavigator, {
                      state: { addressId: elem.id },
                    });
                  }}
                  key={elem.id}
                >
                  <div style={{ display: "flex" }}>
                    <input
                      type="checkbox"
                      checked={selectedAddressId === elem.id}
                      onChange={() => handleCheckboxChange(elem.id)}
                      style={{ marginRight: 10 }}
                    />
                    <h4>
                      {elem.firstname} {elem.lastname}
                    </h4>
                  </div>
                  <p>
                    {elem.flat_plot_no} {elem.wing} {elem.building_name},{" "}
                    {elem.address1} {elem.address2}, {elem.area_name},{" "}
                    {elem.city_name}, {elem.state_name} {elem.pincode}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor: "var(--white-color)",
                padding: 20,
              }}
            >
              <p style={{ textAlign: "center" }}>No addresses found.</p>
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
