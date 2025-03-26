import React, { useEffect, useState } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import { notification } from "antd";

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

  // console.log("profileDataprofileDataprofileData", profileData);

  // console.log("cityIda", cityId);

  const [opacity, setOpacity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<User>({
    id: cityId || "null",
    salutation: "Mr.",
    firstname: "",
    lastname: "",
    gender: "male",
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

        // console.log("response data", response.data.CustomerDetail);

        if (response.data.status === "success") {
          // console.log("User profile data:", response.data.data);
          const profile = response.data.CustomerDetail[0];

          SetProfileData(response.data.CustomerDetail[0]);

          // Check if photo is a URL or base64 string
          const photoUrl = profile.photo ? profile.photo : null;

          // console.log("photoUrlphotoUrl", photoUrl);

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
      // console.log("responseweeupdatedProfile", response);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    return <components.Header title="Update User Details" showGoBack={true} />;
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
              {imagePreview || userDetails.photo ? (
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
                  +
                </span>
              )}
              <span className="upload-icon">
                <i className="fas fa-camera"></i>
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
              <input
                type="text"
                name="firstname"
                value={userDetails.firstname}
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
                value={userDetails.lastname}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="col-6">
              <label className="form-label">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={userDetails.mobile}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="inputWrap">
            <div className="col-6">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={userDetails.gender}
                className="form-input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label">Date of Birth</label>
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
          <div className="submitBtnWrap">
            <button type="submit" className="submit-btn">
              Update User
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
