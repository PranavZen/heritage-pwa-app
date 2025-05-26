import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes, TabScreens } from "../routes";
import { components } from "../components";
import { notification } from "antd";
import { useLocation } from "react-router-dom";
import { svg } from "../assets/svg";

interface Address {
  id?: string;
  c_id: string;
  country_id: string;
  state_id: string;
  city_id: string;
  area_id: string;
  address1: string;
  address2: string;
  pincode: string;
  is_default: string;
  firstname: string;
  lastname: string;
  area_name: string;
  building_name: string;
  building_id?: string;
  city_name?: string;
  state_name?: string;
}

export const NewUsereAddAddress: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();
  const { cityID } = location.state || {};


  // console.log("cityIDcityID", cityID)

  useEffect(() => {
    if (cityID) {
      setNewAddress({
        ...newAddress,
        ...cityID,
      });
    }
  }, [cityID]);

  const [opacity, setOpacity] = useState<number>(0);
  const [newAddress, setNewAddress] = useState<Address>({
    address1: "",
    address2: "",
    pincode: "",
    building_name: "",
    firstname: "",
    lastname: "",
    is_default: "0",
    c_id: "",
    country_id: "1",
    state_id: "",
    city_id: "",
    area_id: "",
    city_name: "",
    state_name: "",
    area_name: "NallaSupara (West)",
  });


  // console.log("newAddress", newAddress);

  const [loading, setLoading] = useState<boolean>(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isPincodeVerified, setIsPincodeVerified] = useState<boolean>(false);
  const [areaIdByPincode, setAreaIdByPincode] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');


  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  useEffect(() => {
    if (areaIdByPincode && Array.isArray(areaIdByPincode) && areaIdByPincode.length > 0) {
      setSelectedAreaId(areaIdByPincode[0].id);
    }
  }, [areaIdByPincode]);

  useEffect(() => {
    if (selectedAreaId) {
      localStorage.setItem('area_id', selectedAreaId);
    }
  }, [selectedAreaId]);
  useEffect(() => {
    if (newAddress.city_id) {
      localStorage.setItem('cityId', newAddress.city_id);
    }
  }, [newAddress.city_id]);


  const verifyPincode = async (pincode: string) => {
    try {
      const formData = new FormData();
      formData.append("pincode", String(pincode));
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/pincodeverify",
        formData
      );

      // console.log("uuuuuu", response);

      if (response.data.status === "success") {
        const cityData = response.data.search_data?.[0];
        if (cityData) {
          setNewAddress((prev) => ({
            ...prev,
            state_id: cityData.state_id || "",
            state_name: cityData.state_name || "",
            city_id: cityData.city_id || "",
            city_name: cityData.city_name || "",
          }));
          setIsPincodeVerified(true);
          notification.success({ message: response.data.message });
        } else {
          setIsPincodeVerified(false);
          notification.error({ message: response.data.message });
        }
      } else {
        setIsPincodeVerified(false);
        notification.error({ message: response.data.message });
      }
    } catch (error) {
      setIsPincodeVerified(false);
      console.error("Error verifying pincode:", error);
      notification.error({ message: "Error verifying pincode" });
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {
      verifyPincode(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const addAddress = async () => {
    const formData = new FormData();
    formData.append("c_id", localStorage.getItem('c_id') || '');
    formData.append("country_id", newAddress.country_id);
    formData.append("state_id", newAddress.state_id);
    formData.append("city_id", newAddress.city_id);
    formData.append("area_id",  selectedAreaId);
    formData.append("address1", newAddress.address1);
    formData.append("address2", newAddress.address2);
    formData.append("pincode", newAddress.pincode);
    formData.append("is_default", newAddress.is_default);
    formData.append("firstname", newAddress.firstname);
    formData.append("lastname", newAddress.lastname);
    formData.append("area_name", newAddress.area_name);
    formData.append("building_name", newAddress.building_name);

    if (newAddress.building_id) {
      formData.append("building_id", newAddress.building_id);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addAddress",
        formData
      );

      // console.log("responserrrrrr", response);

      if (response.data.status === "success") {
        navigate('/tab-navigator');
        notification.success({ message: response.data.message });
      } else if (response.data.status === "fail") {
        notification.error({ message: response.data.message });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error adding address:", error);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.id) {
      // updateAddress();
    } else {
      addAddress();
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title={newAddress.id ? "Update Address" : "Add Address"}
        showGoBack={true}
      />
    );
  };

  // ************************area Id**************************
  useEffect(() => {
    const GetAreaId = async () => {
      try {
        const formData = new FormData();
        formData.append('pincode', newAddress.pincode)
        const response = await axios.post(`https://heritage.bizdel.in/app/consumer/services_v11/getAreaByPincode`, formData);
        // console.log("kkkkkkk", response);
        setAreaIdByPincode(response.data.areaDetails)
      } catch (eror) {
        // console.log(eror)
      }
    }
    GetAreaId();
  }, [newAddress.city_id])

  const handleAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAreaId(event.target.value);
    // console.log('Selected Area ID:', event.target.value);
  };


  // ***********************End Area Id***************************

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    return (
      <section className="scrollable">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-header">
            <h2>Add New Address</h2>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">First Name <span>*</span></label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="firstname"
                    value={newAddress.firstname}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>
              <div className="col-6">
                <label className="form-label">Last Name <span>*</span></label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="lastname"
                    value={newAddress.lastname}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Location Details</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">Pincode <span>*</span></label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    value={newAddress.pincode}
                    onChange={handlePincodeChange}
                    className="form-input"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="col-6">
                <label className="form-label">Select Area <span>*</span></label>
                <div className="select-container">
                  <div className="select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <select
                    className="form-select"
                    value={selectedAreaId}
                    onChange={handleAreaChange}
                    required
                  >
                    <option value="" disabled>Select your area</option>
                    {(areaIdByPincode && Array.isArray(areaIdByPincode) && areaIdByPincode.length > 0) ? (
                      areaIdByPincode.map((elem: any) => (
                        <option key={elem.id} value={elem.id}>
                          {elem.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No areas available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">State</label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="state_name"
                    value={newAddress.state_name}
                    className="form-input"
                    placeholder="State will be auto-filled"
                    readOnly
                  />
                </div>
              </div>

              <div className="col-6">
                <label className="form-label">City</label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="city_name"
                    value={newAddress.city_name}
                    className="form-input"
                    placeholder="City will be auto-filled"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Details</h3>
            <div className="inputWrap">
              <div className="col-12">
                <label className="form-label">Address Line 1 <span>*</span></label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="address1"
                    value={newAddress.address1}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkBoxWrap">
              <input
                type="checkbox"
                id="default-address"
                name="is_default"
                checked={newAddress.is_default === "1"}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    is_default: e.target.checked ? "1" : "0",
                  }))
                }
              />
              <label className="form-label" htmlFor="default-address">Set as default address</label>
            </div>
          </div>

          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
              <span>Add Address</span>
            </button>
          </div>
        </form>
      </section>
    );
  };

  return (
    <div id="screen" className="new-user-address-page" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
