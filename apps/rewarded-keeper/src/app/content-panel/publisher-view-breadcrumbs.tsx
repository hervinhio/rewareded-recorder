import { Group, Publisher, PublisherActivityStatus } from '../types';
import { Link } from 'react-router-dom';
import { getPublisherName } from './util';
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
} from '@fluentui/react-components';
import { BreadcrumbItem } from 'react-bootstrap';

interface Props {
  publisher: Publisher;
  group?: Group;
}

export function PublisherViewBreadCrumbs({ publisher, group }: Props) {
  return (
    <Breadcrumb aria-label="Breacrumb proclamateur groupe">
      {publisher?.isRegularPioneer &&
        publisher?.activityStatus !== PublisherActivityStatus.Inactive && (
          <BreadcrumbItem>
            <Link to={'/groups/pioneers'} replace={true}>
              <BreadcrumbButton>Pionniers</BreadcrumbButton>
            </Link>
          </BreadcrumbItem>
        )}
      {!publisher?.isRegularPioneer &&
        publisher?.activityStatus === PublisherActivityStatus.Inactive && (
          <BreadcrumbItem>
            <Link to={'/groups/inactives'} replace={true}>
              <BreadcrumbButton>Inactifs</BreadcrumbButton>
            </Link>
          </BreadcrumbItem>
        )}
      {publisher?.activityStatus !== PublisherActivityStatus.Inactive &&
        !publisher?.isRegularPioneer && (
          <BreadcrumbItem>
            <Link to={`/groups/${group?.id || 'unafiliated'}`} replace={true}>
              <BreadcrumbButton>
                {group?.name || 'Non affilié'}
              </BreadcrumbButton>
            </Link>
          </BreadcrumbItem>
        )}
      <BreadcrumbDivider />
      <BreadcrumbItem key="publisher">
        <BreadcrumbButton>{getPublisherName(publisher)}</BreadcrumbButton>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
