import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes, TabScreens } from "../routes";
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

  console.log("areaIdByPincode", areaIdByPincode)

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

      console.log("uuuuuu", response);

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
        console.log(eror)
      }
    }
    GetAreaId();
  }, [newAddress.city_id])

  const handleAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAreaId(event.target.value);
    console.log('Selected Area ID:', event.target.value);
  };


  // ***********************End Area Id***************************

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    return (
      <section className="scrollable">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstname"
                value={newAddress.firstname}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastname"
                value={newAddress.lastname}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>


          <div className="inputWrap">

            <div className="col-6">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={newAddress.pincode}
                onChange={handlePincodeChange}
                className="form-input"
                maxLength={6}
              />
            </div>



            <div className="inputWrap">
              <label className="form-label">Select Area ID</label>

              <select value={selectedAreaId} onChange={handleAreaChange}>
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
              <label className="form-label">State</label>
              <input
                type="text"
                name="city_name"
                value={newAddress.state_name}
                className="form-input"
              />
            </div>


            <div className="col-6">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city_name"
                value={newAddress.city_name}
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Address Line 1</label>
            <input
              type="text"
              name="address1"
              value={newAddress.address1}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Address Line 2</label>
            <input
              type="text"
              name="address2"
              value={newAddress.address2}
              onChange={handleInputChange}
              className="form-input"
            />
            <div className="checkBoxWrap">
              <label className="form-label">Default Address</label>
              <input
                type="checkbox"
                name="is_default"
                checked={newAddress.is_default === "1"}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    is_default: e.target.checked ? "1" : "0",
                  }))
                }
              />
            </div>
          </div>


          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
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
