import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Routes } from "../routes";
import "./onboarding.css";
import axios from "axios";
import { components } from "../components";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCityData",
          {
            search_query: searchQuery,
          }
        );
        if (response.data.status === "success") {
          setCities(response.data.cityDetails);
        } else {
          console.error("Failed to fetch cities", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching city data", error);
      }
    };

    fetchCityData();
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const handleCitySelect = (cityId: string) => {
    console.log("rrrrrrrrrrrrrrrrrrrrrr", cityId);
    setSelectedCity(cityId);
    localStorage.setItem("cityId", cityId);
    navigate(Routes.TabNavigator);
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Back" showGoBack={true} />;
  };
  const renderSlider = (): JSX.Element => {
    return (
      <div className="embla">
        {filteredCities.map((city) => (
          <div
            key={city.id}
            className={`city-item ${
              selectedCity === city.id ? "selected" : ""
            }`}
            onClick={() => handleCitySelect(city.id)}
          >
            <p>{city.name}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div id="screen">
      {renderHeader()}
      <section className="scrollable">
        <div className="container">
          <h2>Select Your City</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a city..."
            className="search-input"
          />
          {renderSlider()}
        </div>
      </section>
    </div>
  );
};
