import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
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
  order_active?:string;
}

export const AddressAdd: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();
  const { cityID } = location.state || {};


  console.log("cityIDcityID", cityID)

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
    order_active:""
  });

  console.log("id", newAddress)

  const [loading, setLoading] = useState<boolean>(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isPincodeVerified, setIsPincodeVerified] = useState<boolean>(false);
  const [areaIdByPincode, setAreaIdByPincode] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Validation states
  const [errors, setErrors] = useState<{
    firstname?: string;
    lastname?: string;
    pincode?: string;
    area_id?: string;
    address1?: string;
  }>({});
  const [touched, setTouched] = useState<{
    firstname: boolean;
    lastname: boolean;
    pincode: boolean;
    area_id: boolean;
    address1: boolean;
  }>({
    firstname: false,
    lastname: false,
    pincode: false,
    area_id: false,
    address1: false,
  });

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

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstname':
        return value.trim() === '' ? 'First name is required' : '';
      case 'lastname':
        return value.trim() === '' ? 'Last name is required' : '';
      case 'pincode':
        if (value.trim() === '') return 'Pincode is required';
        if (!/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
        return '';
      case 'address1':
        return value.trim() === '' ? 'Address is required' : '';
      case 'area_id':
        return value === '' ? 'Please select an area' : '';
      default:
        return '';
    }
  };

  // Show error notification for a specific field
  const showErrorNotification = (fieldName: string, errorMessage: string) => {
    const fieldLabels: Record<string, string> = {
      firstname: 'First Name',
      lastname: 'Last Name',
      pincode: 'Pincode',
      address1: 'Address',
      area_id: 'Area'
    };

    notification.error({
      message: `${fieldLabels[fieldName]} Error`,
      description: errorMessage,
      placement: 'topRight',
      duration: 3
    });
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};
    let isValid = true;
    const errorMessages: string[] = [];

    // Validate firstname
    const firstnameError = validateField('firstname', newAddress.firstname);
    if (firstnameError) {
      newErrors.firstname = firstnameError;
      errorMessages.push(`First Name: ${firstnameError}`);
      isValid = false;
    }

    // Validate lastname
    const lastnameError = validateField('lastname', newAddress.lastname);
    if (lastnameError) {
      newErrors.lastname = lastnameError;
      errorMessages.push(`Last Name: ${lastnameError}`);
      isValid = false;
    }

    // Validate pincode
    const pincodeError = validateField('pincode', newAddress.pincode);
    if (pincodeError) {
      newErrors.pincode = pincodeError;
      errorMessages.push(`Pincode: ${pincodeError}`);
      isValid = false;
    }

    // Validate address1
    const address1Error = validateField('address1', newAddress.address1);
    if (address1Error) {
      newErrors.address1 = address1Error;
      errorMessages.push(`Address: ${address1Error}`);
      isValid = false;
    }

    // Validate area_id
    const areaIdError = validateField('area_id', selectedAreaId);
    if (areaIdError) {
      newErrors.area_id = areaIdError;
      errorMessages.push(`Area: ${areaIdError}`);
      isValid = false;
    }

    setErrors(newErrors);

    // Show a summary notification with all errors
    if (!isValid) {
      notification.error({
        message: "Form Validation Errors",
        description: (
          <div className="error-notification-list">
            {errorMessages.map((msg, index) => (
              <div key={index} className="error-notification-item">• {msg}</div>
            ))}
          </div>
        ),
        placement: 'topRight',
        duration: 5
      });
    }

    return isValid;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Show notification for error if field is touched and has error
    if (error) {
      showErrorNotification(name, error);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      pincode: value,
    }));

    setTouched(prev => ({ ...prev, pincode: true }));
    const error = validateField('pincode', value);
    setErrors(prev => ({ ...prev, pincode: error }));

    // Only show notification for error if the user has stopped typing (6 digits entered)
    if (value.length === 6) {
      verifyPincode(value);
      if (error) {
        showErrorNotification('pincode', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));

      // Don't show notifications during typing to avoid overwhelming the user
      // Notifications will be shown on blur or form submission
    }
  };

  
  const updateAddress = async () => {
     if (newAddress.order_active === '1') {
    notification.warning({
      message: "Address Cannot Be Updated",
      description: "You have an active order. This address cannot be modified at the moment.",
      placement: 'topRight',
      duration: 4,
    });
    return; 
  }
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
        // Show enhanced success notification
        notification.success({
          message: "Address Updated Successfully",
          description: response.data.message || "Your address has been updated successfully.",
          placement: 'topRight',
          duration: 3
        });
        navigate(Routes.MyAddress);
      } else {
        // Show enhanced error notification
        notification.error({
          message: "Failed to Update Address",
          description: response.data.message || "An error occurred while updating your address.",
          placement: 'topRight',
          duration: 4
        });
      }
    } catch (error) {
      console.error("Error updating address:", error);
      // Show error notification for unexpected errors
      notification.error({
        message: "Failed to Update Address",
        description: "An unexpected error occurred. Please try again later.",
        placement: 'topRight',
        duration: 4
      });
    } finally {
      setLoading(false);
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

      if (response.data.status === "success") {
        // Show enhanced success notification
        notification.success({
          message: "Address Added Successfully",
          description: response.data.message || "Your new address has been added to your account.",
          placement: 'topRight',
          duration: 3
        });
        navigate(Routes.MyAddress);
      } else if (response.data.status === "fail") {
        // Show enhanced error notification
        notification.error({
          message: "Failed to Add Address",
          description: response.data.message || "An error occurred while adding your address.",
          placement: 'topRight',
          duration: 4
        });
      }
    } catch (error) {
      console.error("Error adding address:", error);
      // Show error notification for unexpected errors
      notification.error({
        message: "Failed to Add Address",
        description: "An unexpected error occurred. Please try again later.",
        placement: 'topRight',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstname: true,
      lastname: true,
      pincode: true,
      area_id: true,
      address1: true,
    });

    // Validate all fields
    if (validateForm()) {
      if (newAddress.id) {
        updateAddress();
      } else {
        addAddress();
      }
    }
    // No need for an additional notification here since validateForm already shows one
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
        if (newAddress.pincode && newAddress.pincode.length === 6) {
          const formData = new FormData();
          formData.append('pincode', newAddress.pincode);
          const response = await axios.post(`https://heritage.bizdel.in/app/consumer/services_v11/getAreaByPincode`, formData);
          setAreaIdByPincode(response.data.areaDetails);
          console.log('bbbbb', response);
        }
      } catch (error) {
        console.error("Error fetching area details:", error);
        setAreaIdByPincode([]);
      }
    }
    GetAreaId();
  }, [newAddress.city_id, newAddress.pincode])

  const handleAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedAreaId(value);

    setTouched(prev => ({ ...prev, area_id: true }));
    const error = validateField('area_id', value);
    setErrors(prev => ({ ...prev, area_id: error }));

    // Show notification for error when area is selected/changed
    if (error) {
      showErrorNotification('area_id', error);
    }
  };


  // ***********************End Area Id***************************
  
  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    return (
      <section className="scrollable">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-header">
            <h2>{newAddress.id ? "Update Your Address" : "Add New Address"}</h2>
          </div>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">First Name <span>*</span></label>
                <div className={`input-container ${touched.firstname && !errors.firstname ? 'valid' : ''}`}>
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
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="Enter first name"
                    required
                  />
                  {touched.firstname && errors.firstname && (
                    <div className="validation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6f61"/>
                      </svg>
                    </div>
                  )}
                  {touched.firstname && !errors.firstname && (
                    <div className="validation-icon valid">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
                      </svg>
                    </div>
                  )}
                </div>
                {touched.firstname && errors.firstname && (
                  <div className="error-message">{errors.firstname}</div>
                )}
              </div>
              <div className="col-6">
                <label className="form-label">Last Name <span>*</span></label>
                <div className={`input-container ${touched.lastname && !errors.lastname ? 'valid' : ''}`}>
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
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="Enter last name"
                    required
                  />
                  {touched.lastname && errors.lastname && (
                    <div className="validation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6f61"/>
                      </svg>
                    </div>
                  )}
                  {touched.lastname && !errors.lastname && (
                    <div className="validation-icon valid">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
                      </svg>
                    </div>
                  )}
                </div>
                {touched.lastname && errors.lastname && (
                  <div className="error-message">{errors.lastname}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Location Details</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">Pincode <span>*</span></label>
                <div className={`input-container ${touched.pincode && !errors.pincode ? 'valid' : ''}`}>
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
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    required
                  />
                  {touched.pincode && errors.pincode && (
                    <div className="validation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6f61"/>
                      </svg>
                    </div>
                  )}
                  {touched.pincode && !errors.pincode && (
                    <div className="validation-icon valid">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
                      </svg>
                    </div>
                  )}
                </div>
                {touched.pincode && errors.pincode && (
                  <div className="error-message">{errors.pincode}</div>
                )}
              </div>

              <div className="col-6">
                <label className="form-label">Select Area <span>*</span></label>
                <div className={`select-container ${touched.area_id && !errors.area_id ? 'valid' : ''}`}>
                  <div className="select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <select
                    name="area_id"
                    value={selectedAreaId}
                    onChange={handleAreaChange}
                    onBlur={handleBlur}
                    className="form-select"
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
                  {touched.area_id && errors.area_id && (
                    <div className="validation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6f61"/>
                      </svg>
                    </div>
                  )}
                  {touched.area_id && !errors.area_id && (
                    <div className="validation-icon valid">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
                      </svg>
                    </div>
                  )}
                </div>
                {touched.area_id && errors.area_id && (
                  <div className="error-message">{errors.area_id}</div>
                )}
              </div>
            </div>

            <div className="inputWrap">
              <div className="col-6">
                <label className="form-label">State</label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" fill="#1a712e"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="state_name"
                    value={newAddress.state_name}
                    className="form-input"
                    placeholder="State will appear here"
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
                    placeholder="City will appear here"
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
                <div className={`input-container ${touched.address1 && !errors.address1 ? 'valid' : ''}`}>
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
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="Enter your street address"
                    required
                  />
                  {touched.address1 && errors.address1 && (
                    <div className="validation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6f61"/>
                      </svg>
                    </div>
                  )}
                  {touched.address1 && !errors.address1 && (
                    <div className="validation-icon valid">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
                      </svg>
                    </div>
                  )}
                </div>
                {touched.address1 && errors.address1 && (
                  <div className="error-message">{errors.address1}</div>
                )}
              </div>
            </div>
          </div>

          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
              <span>{newAddress.id ? "Update Address" : "Add Address"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
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
