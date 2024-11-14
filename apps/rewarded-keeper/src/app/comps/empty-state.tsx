import { makeStyles, Title1, Title3 } from "@fluentui/react-components";
import { ReactElement } from "react";

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
        height: '100%',
    }
});


export function EmptyState({ children, header, description }: Props) {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <Title1>{header}</Title1>
            {description && <Title3>description</Title3>}
            {children && children}
        </div>
    )
}
