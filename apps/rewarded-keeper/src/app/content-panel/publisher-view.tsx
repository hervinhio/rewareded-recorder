import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import Button, { ButtonGroup } from "@atlaskit/button";
import Lozenge from "@atlaskit/lozenge";
import Page from "@atlaskit/page";
import PageHeader from "@atlaskit/page-header";
import { useState } from "react";
import { RepportModal } from "../modals";
import { currentUserHasPermission, Publisher } from "../types";
import { PublisherModificationView } from "./publisher-modification-view";
import { RepportsView } from "./repports-view";
import { getPublisherName } from "./util";

interface Props {
    publisher: Publisher;
}

interface State {
    showRepportModal: boolean;
    showModificationView: boolean;
    setShowRepportModal: (show: boolean) => void;
    setShowModificationView: (show: boolean) => void;
}
export const PublisherView = (props: Props) => {
    const [ showRepportModal, setShowRepportModal ] = useState(false);
    const [ showModificationView, setShowModificationView] = useState(false);
    const state: State = {
        showRepportModal,
        showModificationView,
        setShowRepportModal,
        setShowModificationView,
    };

    return showModificationView ? renderModificationView(state, props) : renderThisView(state, props);
};

const renderModificationView = (state: State, props: Props) => {
    return (
        <PublisherModificationView publisher={props.publisher} onHide={() => state.setShowModificationView(false)} />
    );
}

const renderThisView = (state: State, props: Props) => {
    return (
        <Page>
             <PageHeader
                actions={makeActionsContent(state.setShowRepportModal, state.setShowModificationView)}
                bottomBar={makeBottomBar(props.publisher)}
            >
                {getPublisherName(props.publisher)}
            </PageHeader>
            <RepportsView publisher={props.publisher}/>
            {state.showRepportModal && <RepportModal publisherId={props.publisher.id} show={state.showRepportModal} onHide={() => state.setShowRepportModal(false)}/>}
        </Page>
    );
}

const makeActionsContent = (setShowRepportModal: (show: boolean) => void, setShowModificationView: (show: boolean) => void) => {
    const isAdmin = currentUserHasPermission('admin');
    return (
        <ButtonGroup>
            <Button appearance="primary" onClick={() => setShowRepportModal(true)}>Nouveau rapport</Button>
            <Button onClick={() => setShowModificationView(true)} isDisabled={!isAdmin}>Modifier</Button>
        </ButtonGroup>
    );
};

const makeBottomBar = (publisher: Publisher) => {
    return (
        <>
            <div>
                {publisher.isElder && <Lozenge>Ancien</Lozenge>}
            </div>
            <div>
                {publisher.isRegularPioneer && <Lozenge isBold>Pionnier</Lozenge>}
            </div>
            <div>
                {publisher.isAuxylaryPioneer && <Lozenge isBold>Pionnier auxiliaire</Lozenge>}
            </div>
        </>
    );
}
