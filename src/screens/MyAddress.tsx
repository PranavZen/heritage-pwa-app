import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import axios from "axios";
import { notification, Modal } from "antd";

export const MyAddress: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [newAddress, setNewAddress] = useState<any | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const c_id = localStorage.getItem("c_id");

  useEffect(() => {
    const fetchAddresses = async () => {
      const formData = new FormData();

      formData.append('c_id', c_id || '0');
      try {
        setLoading(true);
        const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/getAllAddressById', formData);
        // console.log('xxxxxxxxxxxxxxx', response.data.addresses);

        setAddresses(response.data.addresses);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, [c_id]);

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
      onOk: () => {
        setDeleteAddressId(id);
      },
      onCancel: () => {
        console.log("Delete canceled");
      },
    });
  };

  const movetoAddressAddPage = () => {
    const c_id = localStorage.getItem('c_id');

    if (!c_id) {
      Modal.info({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/sign-in');
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

    return (

      <main className="scrollable container">
        <section
          className="accordion"
          style={{ paddingTop: 10 }}
        >
          {/* New Address Section */}
          <div
            onClick={movetoAddressAddPage}
            style={{
              borderRadius: 10,
              marginBottom: 10,
              border: '1px solid red',
              backgroundColor: 'var(--white-color)',
              padding: 20,
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: "600", color: "green" }}>
              New Address
            </p>
          </div>

          {Array.isArray(addresses) && addresses.length > 0 ? (
            <div
              style={{
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor: 'var(--white-color)',
                padding: 20,
              }}
            >
              <h3>Existing Addresses</h3>

              {addresses.map((elem) => (
                <div className="myaddress-getting-separate" key={elem.id}>
                  <h4>
                    {elem.firstname} {elem.lastname}
                  </h4>
                  <p>
                    {elem.flat_plot_no} {elem.wing} {elem.building_name},{" "}
                    {elem.address1} {elem.address2},{elem.area_name},{" "}
                    {elem.city_name}, {elem.state_name} {elem.pincode}
                  </p>
                  <div className="myAddressActionBtnWrap">
                    <span
                      onClick={() => {
                        navigate(Routes.AddressAdd, {
                          state: { cityID: elem },
                        });
                      }}
                      className="editBtn btns"
                    >
                      <i className="fa fa-edit"></i>
                    </span>
                    <span
                      onClick={() => {
                        confirmDelete(elem.id);
                      }}
                      className="deleteBtn btns"
                    >
                      <i className="fa fa-trash"></i>
                    </span>
                    {elem.is_default !== "1" && (
                      <span
                        onClick={() => {
                          confirmDelete(elem.id);
                        }}
                        className="deleteBtn btns"
                      >
                        <div className="fa fa-trash"></div>
                      </span>
                    )}

                    {elem.is_default === 1 && (
                      <p style={{ color: "green", fontWeight: "bold" }}>
                        Default Address
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor: 'var(--white-color)',
                padding: 20,
              }}
            >
              <h3>No data found</h3>
            </div>
          )}



        </section>
      </main>

    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
