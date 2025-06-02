import React, { useEffect, useState } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import { notification } from "antd";
import placeholderImg from '../assets/icons/placeholder.jpg';
import { svg } from '../assets/svg';

interface User {
  id: string;
  salutation: string;
  firstname: string;
  lastname: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  photo: File | null;
  photo_url: string | null;
}

export const EditProfile: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const cityId = localStorage.getItem("c_id");
  const [profileData, SetProfileData] = useState();
  const [opacity, setOpacity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<User>({
    id: cityId || "null",
    salutation: "Mr.",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    email: "",
    mobile: "",
    photo: null,
    photo_url: null,
  });

  // **************************Get profile data*********************
  useEffect(() => {
    const GetProfileData = async () => {
      const formData = new FormData();
      formData.append("c_id", cityId || "null");
      try {
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCustomerById",
          formData
        );
        if (response.data.status === "success") {
          const profile = response.data.CustomerDetail[0];
          SetProfileData(response.data.CustomerDetail[0]);
          const photoUrl = profile.photo ? profile.photo : null;
          setUserDetails({
            id: profile.id,
            salutation: profile.saluation,
            firstname: profile.firstname,
            lastname: profile.lastname,
            gender: profile.gender,
            dob: profile.dob,
            email: profile.email,
            mobile: profile.mobile,
            photo: profile.photo ? profile.photo : null,
            photo_url: profile.photo_url || null,
          });
        } else {
          // console.log("Error:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    GetProfileData();
  }, []);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const updateUser = async () => {
    const formData = new FormData();
    formData.append("id", userDetails.id);
    formData.append("salutation", userDetails.salutation);
    formData.append("firstname", userDetails.firstname);
    formData.append("lastname", userDetails.lastname);
    formData.append("gender", userDetails.gender);
    formData.append("dob", userDetails.dob);
    formData.append("email", userDetails.email);
    formData.append("mobile", userDetails.mobile);

    if (userDetails.photo) {
      formData.append("photo", userDetails.photo);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateUser",
        formData
      );
      if (response.data.status === "success") {
        navigate(Routes.EditProfile);
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: response.data.message });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating user details:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setUserDetails((prev) => ({
      ...prev,
      photo: file,
    }));

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser();
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Edit Profile" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;

    return (
      <section className="scrollable">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="upload-container">
            <label
              htmlFor="photo-upload"
              className="upload-circle"
              style={{ cursor: "pointer" }}
            >
              {imagePreview || userDetails.photo ?(
                <img
                  src={
                    imagePreview ||
                    (userDetails.photo && userDetails.photo_url
                      ? `${userDetails.photo_url}${userDetails.photo}`
                      : "")
                  }
                  alt="Profile"
                />
              ) : (
                <span
                  style={{
                    lineHeight: "100px",
                    fontSize: "24px",
                    color: "#fff",
                  }}
                >
                  <img src={placeholderImg} alt="" width={100} height={100}/>
                </span>
              )}
              <span className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="white"/>
                </svg>
              </span>
            </label>

            <input
              type="file"
              id="photo-upload"
              name="photo"
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>

          <div className="inputWrap">
            {/* <div className="col-2">
              <label className="form-label">Sal.</label>
              <input
                type="text"
                name="salutation"
                value={userDetails.salutation}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div> */}

            <div className="col-6">
              <label className="form-label">First Name</label>
              <div className="input-container">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1a712e"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="firstname"
                  value={userDetails.firstname}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>

            <div className="col-6">
              <label className="form-label">Last Name</label>
              <div className="input-container">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1a712e"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="lastname"
                  value={userDetails.lastname}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">Email</label>
              <div className="input-container">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#1a712e"/>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="col-6">
              <label className="form-label">Mobile</label>
              <div className="input-container">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3-3H7V4h10v14z" fill="#1a712e"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="mobile"
                  value={userDetails.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>
          </div>
          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">Gender</label>
              <div className="select-container">
                <div className="select-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1a712e"/>
                  </svg>
                </div>
                <select
                  name="gender"
                  value={userDetails.gender}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="col-6">
              <label className="form-label">Date of Birth</label>
              <div className="input-container">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" fill="#1a712e"/>
                  </svg>
                </div>
                <input
                  type="date"
                  name="dob"
                  value={userDetails.dob}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>
          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
              <span>Update Profile</span>
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
