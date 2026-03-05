import {
  Caption1,
  makeStyles,
  tokens,
  Title3,
} from '@fluentui/react-components';
import { ReactElement } from 'react';

interface Props {
  children?: ReactElement;
  description?: string;
  isLoading?: boolean;
  imageUrl?: string;
  header: string;
}

const useStyles = makeStyles({
  container: {
    textAlign: 'center',
    alignContent: 'center',
    width: '100%',
    height: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'middle',
    flexDirection: 'column',
    color: tokens.colorNeutralForeground2Link,
  },
});

export function EmptyState({ children, header, description, imageUrl }: Props) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {imageUrl && (
        <img src={imageUrl} height={100} width={100} alt="Empty state image" />
      )}
      <Title3 style={{ textAlign: 'center' }}>{header}</Title3>
      {description && (
        <Caption1 style={{ textAlign: 'center' }}>{description}</Caption1>
      )}
      {children && children}
    </div>
  );
}
