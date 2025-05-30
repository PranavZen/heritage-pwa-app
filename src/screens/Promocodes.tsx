import React, { useEffect, useState } from "react";
import { hooks } from "../hooks";
import { items } from "../items";
import { svg } from "../assets/svg";
import { components } from "../components";
import { PromocodeType } from "../types";
import axios from "axios";

// Type definition for a locator element
interface LocatorElement {
  name: string;
  address1: string;
  address2: string;
  city_name: string;
  state_name: string;
  country_name: string;
}

export const Promocodes: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [locator, setLocator] = useState<LocatorElement[] | undefined>(
    undefined
  );
  const c_id = localStorage.getItem("c_id");

  useEffect(() => {
    const storeLocator = async () => {
      const formData = new FormData();
      formData.append("c_id", localStorage.getItem('c_id')|| '');
      formData.append('latitude', '17.4654686')
      formData.append('longitude', '78.4277117')
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/store_locator`,
          formData
        );
        // console.log("responseresponseLocator", response);

        setLocator(response.data.distributors);
      } catch (error) {
        // console.log(error);
      }
    };
    storeLocator();
  }, [c_id]);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const { promocodesLoading, promocodes } = hooks.useGetPromocodes();

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} title="Store Locator" />;
  };

  const renderContent = (): JSX.Element | null => {
    if (!locator) {
      return null;
    }

    return (
      <main className="scrollable">
        <ul className="clientNotificationWrap">
          {locator.map((elem: LocatorElement, index: number) => {
            return (
              <li key={index} className="notification-client">
                <h3 className="mainText">{elem.name}</h3>
                <p className="subText" style={{lineHeight: 1.4, marginBottom: 5}}>{elem.address1}</p>
                <p className="subText" style={{lineHeight: 1.4, marginBottom: 5}}>{elem.address2}</p>
                <p className="subText" style={{lineHeight: 1.4, marginBottom: 5}}>
                  {elem.city_name}, {elem.state_name}, {elem.country_name}
                </p>
              </li>
            );
          })}
        </ul>
      </main>
    );
  };

  const renderLoader = (): JSX.Element | null => {
    if (promocodesLoading || promocodes.length === 0) {
      return <components.Loader />;
    }
    return null;
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
      {renderLoader()}
    </div>
  );
};
