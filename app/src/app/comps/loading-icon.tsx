const loadingIcon = require('./loading.gif');
import './loading-icon.scss';

export const LoadingIcon = () => {
  return <img className="loading-icon" src={loadingIcon} alt="Loading Icon" />;
};
