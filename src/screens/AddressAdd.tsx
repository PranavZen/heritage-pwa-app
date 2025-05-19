import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import { notification } from "antd";
import { useLocation } from "react-router-dom";

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

export const AddressAdd: React.FC = () => {
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

  // console.log("areaIdByPincode", areaIdByPincode)

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

  const updateAddress = async () => {
    const formData = new FormData();
    formData.append("address_id", newAddress.id || "");
    formData.append("c_id", newAddress.c_id);
    formData.append("country_id", newAddress.country_id);
    formData.append("state_id", newAddress.state_id);
    formData.append("city_id", newAddress.city_id);
    formData.append("area_id", localStorage.getItem('area_id') || '');
    formData.append("address1", newAddress.address1);
    formData.append("address2", newAddress.address2);
    formData.append("pincode", newAddress.pincode);
    formData.append("is_default", newAddress.is_default);
    formData.append("firstname", newAddress.firstname);
    formData.append("lastname", newAddress.lastname);
    formData.append("building_name", newAddress.building_name);

    if (newAddress.building_id) {
      formData.append("building_id", newAddress.building_id);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateAddress",
        formData
      );

      if (response.data.status === "success") {
        navigate(Routes.MyAddress);
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: response.data.message });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating address:", error);
    }
  };

  const addAddress = async () => {
    const formData = new FormData();
    formData.append("c_id", localStorage.getItem('c_id') || '');
    formData.append("country_id", newAddress.country_id);
    formData.append("state_id", newAddress.state_id);
    formData.append("city_id", newAddress.city_id);
    formData.append("area_id", localStorage.getItem('area_id') || '' || selectedAreaId);
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
        navigate(Routes.MyAddress);
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
      updateAddress();
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
      <section className="scrollable address-add-page">
        <form onSubmit={handleSubmit} className="form-container">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="firstname" className="form-label required">First Name<span>*</span></label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={newAddress.firstname}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter your first name"
                  aria-required="true"
                />
              </div>
              <div className="col-6">
                <label htmlFor="lastname" className="form-label required">Last Name<span>*</span></label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={newAddress.lastname}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter your last name"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="form-section">
            <h3>Location Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="pincode" className="form-label required">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Pincode<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={newAddress.pincode}
                  onChange={handlePincodeChange}
                  className={`form-input ${isPincodeVerified ? 'verified' : ''}`}
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit pincode"
                  aria-required="true"
                />
              </div>

              <div className="col-6">
                <label htmlFor="area" className="form-label required">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Area<span>*</span>
                  </div>
                </label>
                <select
                  id="area"
                  value={selectedAreaId}
                  onChange={handleAreaChange}
                  required
                  aria-required="true"
                >
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

            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="state" className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    State<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state_name"
                  value={newAddress.state_name}
                  className="form-input"
                  readOnly
                  aria-label="State (auto-filled from pincode)"
                />
              </div>

              <div className="col-6">
                <label htmlFor="city" className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    City<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city_name"
                  value={newAddress.city_name}
                  className="form-input"
                  readOnly
                  aria-label="City (auto-filled from pincode)"
                />
              </div>
            </div>
          </div>

          {/* Address Details Section */}
          <div className="form-section">
            <h3>Address Details</h3>
            <div className="inputWrap">
              <div className="col-12">
                <label htmlFor="building_name" className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    Building/Apartment Name<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="building_name"
                  name="building_name"
                  value={newAddress.building_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter building or apartment name"
                />
              </div>
            </div>

            <div className="inputWrap">
              <div className="col-12">
                <label htmlFor="address1" className="form-label required">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Address Line 1<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={newAddress.address1}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter your street address"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="inputWrap">
              <div className="col-12">
                <label htmlFor="address2" className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Address Line 2<span>*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={newAddress.address2}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                />
              </div>
            </div>

            <div className="checkBoxWrap">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={newAddress.is_default === "1"}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    is_default: e.target.checked ? "1" : "0",
                  }))
                }
              />
              <label htmlFor="is_default" className="form-label">Set as default address</label>
            </div>
          </div>

          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {newAddress.id ? (
                  <>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </>
                ) : (
                  <>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </>
                )}
              </svg>
              {newAddress.id ? "Update Address" : "Add Address"}
            </button>
          </div>
        </form>
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
