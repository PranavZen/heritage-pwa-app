import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {components} from '../components';

export const SignUp: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            height: '100%',
            paddingTop: '22%',
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <h1 style={{marginBottom: 30, textTransform: 'capitalize'}}>
            Sign up
          </h1>
          <components.Input
            placeholder='Name'
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.UserSvg />}
          />
          <components.Input
            placeholder='Email'
            leftIcon={<svg.MailSvg />}
            rightIcon={<svg.CheckSvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Password'
            leftIcon={<svg.KeySvg />}
            rightIcon={<svg.EyeOffSvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Confirm password'
            leftIcon={<svg.KeySvg />}
            rightIcon={<svg.EyeOffSvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Button
            text='Sign up'
            containerStyle={{marginBottom: 20}}
            onClick={() => {
              navigate(Routes.VerifyYourPhoneNumber);
            }}
          />
          <div
            style={{gap: 4}}
            className='row-center'
          >
            <span className='t14'>Already have an account?</span>
            <span
              className='t14 clickable'
              style={{color: 'var(--main-turquoise)'}}
              onClick={() => {
                navigate(Routes.SignIn);
              }}
            >
              Sign in.
            </span>
          </div>
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <footer
        className='container row-center'
        style={{gap: 15, paddingTop: 10, paddingBottom: 10}}
      >
        <button
          className='center'
          style={{
            backgroundColor: 'white',
            width: '100%',
            height: 50,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <svg.FaceBookSvg />
        </button>
        <button
          className='center'
          style={{
            backgroundColor: 'white',
            width: '100%',
            height: 50,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <svg.GoogleSvg />
        </button>
      </footer>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
};
