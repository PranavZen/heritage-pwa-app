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
  flat_plot_no: string;
  wing: string;
  building_id?: string;
}

export const AddressAdd: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();
  const { cityID } = location.state || {};

  const [opacity, setOpacity] = useState<number>(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    address1: "",
    address2: "",
    pincode: "",
    building_name: "",
    flat_plot_no: "",
    wing: "",
    firstname: "",
    lastname: "",
    is_default: "0",
    c_id: "",
    country_id: "1",
    state_id: "",
    city_id: "",
    area_id: "",
    area_name: "NallaSupara (West)",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const fetchStates = async (countryId: string) => {
    const formData = new FormData();
    formData.append("country_id", countryId);
    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/getStateByCountryId",
        formData
      );
      setStates(response.data.stateDetails);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCities = async (stateId: string) => {
    const formData = new FormData();
    formData.append("state_id", stateId);

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/getCityByStateId",
        formData
      );
      setCities(response.data.cityDetails);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // console.log("aaaaaaa", newAddress);

  const updateAddress = async () => {
    const formData = new FormData();
    formData.append("address_id", newAddress.id || "");
    formData.append("c_id", newAddress.c_id);
    formData.append("country_id", newAddress.country_id);
    formData.append("state_id", newAddress.state_id);
    formData.append("city_id", newAddress.city_id);
    formData.append("area_id", newAddress.area_id);
    formData.append("address1", newAddress.address1);
    formData.append("address2", newAddress.address2);
    formData.append("pincode", newAddress.pincode);
    formData.append("is_default", newAddress.is_default);
    formData.append("firstname", newAddress.firstname);
    formData.append("lastname", newAddress.lastname);
    formData.append("building_name", newAddress.building_name);
    formData.append("flat_plot_no", newAddress.flat_plot_no);
    formData.append("wing", newAddress.wing);

    // Handle building_id only if it is not empty
    if (newAddress.building_id) {
      formData.append("building_id", newAddress.building_id);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateAddress",
        formData
      );
      // console.log("ResponseUpdate: ", response);
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
    formData.append("id", "");
    formData.append("c_id", newAddress.c_id);
    formData.append("country_id", newAddress.country_id);
    formData.append("state_id", newAddress.state_id);
    formData.append("city_id", newAddress.city_id);
    formData.append("area_id", newAddress.area_id);
    formData.append("address1", newAddress.address1);
    formData.append("address2", newAddress.address2);
    formData.append("pincode", newAddress.pincode);
    formData.append("is_default", newAddress.is_default);
    formData.append("firstname", newAddress.firstname);
    formData.append("lastname", newAddress.lastname);
    formData.append("area_name", newAddress.area_name);
    formData.append("building_name", newAddress.building_name);
    formData.append("flat_plot_no", newAddress.flat_plot_no);
    formData.append("wing", newAddress.wing);

    // Handle building_id only if it is not empty
    if (newAddress.building_id) {
      formData.append("building_id", newAddress.building_id);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addAddress",
        formData
      );
      // console.log("Response: ", response);
      if (response.data.status === "success") {
        navigate(Routes.MyAddress);
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: response.data.message });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error adding address:", error);
    }
  };

  useEffect(() => {
    if (cityID) {
      setNewAddress({
        ...newAddress,
        ...cityID,
      });
    }
    fetchStates(newAddress.country_id);
  }, [cityID]);

  useEffect(() => {
    if (newAddress.state_id) {
      fetchCities(newAddress.state_id);
    }
  }, [newAddress.state_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Submitting with city_id:", newAddress.city_id);
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
              <label className="form-label">Country</label>
              <select
                name="country_id"
                value={newAddress.country_id}
                onChange={(e) => {
                  setNewAddress((prev) => ({
                    ...prev,
                    country_id: e.target.value,
                  }));
                  fetchStates(e.target.value);
                }}
                className="form-input"
              >
                <option value="1">India</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label">State</label>
              <select
                name="state_id"
                value={newAddress.state_id}
                onChange={(e) => {
                  setNewAddress((prev) => ({
                    ...prev,
                    state_id: e.target.value,
                  }));
                }}
                className="form-input"
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">City</label>
              <select
                name="city_id"
                value={newAddress.city_id}
                onChange={(e) => {
                  setNewAddress((prev) => ({
                    ...prev,
                    city_id: e.target.value,
                  }));
                }}
                className="form-input"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Building Name</label>
              <input
                type="text"
                name="building_name"
                value={newAddress.building_name}
                onChange={handleInputChange}
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

          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={newAddress.pincode}
                onChange={handleInputChange}
                className="form-input"
                required
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
