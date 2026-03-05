import './signin-button.scss';
import googleLogo from './google-logo.png';
import {
  Caption1Strong,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { borderRadius } from '@mui/system';

interface SignInButtonProps {
  onClick: () => void;
  text: string;
}

const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusCircular,
    paddingRight: '16px',
    boxShadow: tokens.shadow4,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  logo: {
    borderRadius: tokens.borderRadiusCircular,
    display: 'flex',
    width: '48px',
    height: '52px',
  },
  caption: {
    margin: 'auto',
  },
});

export const SignInButton = (props: SignInButtonProps) => {
  const styles = useStyles();

  return (
    <div
      className={mergeClasses(styles.container, 'signin-button')}
      onClick={props.onClick}>
      <span className={mergeClasses(styles.logo, 'google-logo')}>
        <img src={googleLogo} alt="Logo Google"></img>
      </span>
      <Caption1Strong className={styles.caption}>{props.text}</Caption1Strong>
    </div>
  );
};
