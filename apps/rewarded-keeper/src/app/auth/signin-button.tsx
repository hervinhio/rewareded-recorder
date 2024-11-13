import './signin-button.scss';
import googleLogo from './google-logo.png';
import { Caption1 } from '@fluentui/react-components';

interface SignInButtonProps {
  onClick: () => void;
  text: string;
}

export const SignInButton = (props: SignInButtonProps) => {
  return (
    <div className="signin-button" onClick={props.onClick}>
      <span className="google-logo">
        <img src={googleLogo} alt="Logo Google"></img>
      </span>
      <Caption1>{props.text}</Caption1>
    </div>
  );
};
