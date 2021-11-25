import './signin-button.scss';
import googleLogo from './google-logo.png';

interface SignInButtonProps {
  onClick: () => void;
}

export const SignInButton = (props: SignInButtonProps) => {
  return (
    <div className="signin-button" onClick={props.onClick}>
      <span className="google-logo">
        <img src={googleLogo}></img>
      </span>
      <span className="caption">
        Se connecter avec google
      </span>
    </div>
  );
}
