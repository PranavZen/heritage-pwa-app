import React, { useEffect, useState } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { components } from "../components";
import { notification } from "antd";
import placeholderImg from '../assets/icons/placeholder.jpg';

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
      <section className="scrollable edit-profile-page">
        <div className="profile-header">
          <h2>Edit Your Profile</h2>
          <p>Update your personal information and profile picture</p>
        </div>

        <form onSubmit={handleSubmit} className="form-container" aria-label="Edit profile form">
          <div className="upload-container" role="region" aria-label="Profile photo">
            <label
              htmlFor="photo-upload"
              className="upload-circle"
              tabIndex={0}
              role="button"
              aria-label="Upload profile picture"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('photo-upload')?.click();
                }
              }}
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
                <img src={placeholderImg} alt="Default profile" width={100} height={100}/>
              )}
              <span className="upload-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
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
              aria-label="Upload profile picture"
            />
            <p className="upload-label">Click to upload a new photo</p>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="firstname" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={userDetails.firstname}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="col-6">
                <label htmlFor="lastname" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={userDetails.lastname}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={userDetails.gender}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-label="Select your gender"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="col-6">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={userDetails.dob}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  aria-label="Select your date of birth"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="inputWrap">
              <div className="col-6">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Enter your email address"
                  aria-label="Email address"
                />
              </div>

              <div className="col-6">
                <label htmlFor="mobile" className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={userDetails.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Enter your mobile number"
                  aria-label="Mobile number"
                />
              </div>
            </div>
          </div>

          <div className="submitBtnWrap">
            <button
              type="submit"
              className="submit-btn"
              aria-label="Update profile information"
            >
              Save Changes
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
