import './signin-button.scss';
const GoogleLogo = require('./google-logo.png');

interface SignInButtonProps {
  onClick: () => void;
  text: string;
}

export const SignInButton = (props: SignInButtonProps) => {
  return (
    <div className="signin-button" onClick={props.onClick}>
      <span className="google-logo">
        <img src={GoogleLogo} alt="Logo Google"></img>
      </span>
      <span className="caption">{props.text}</span>
    </div>
  );
};
