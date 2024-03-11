import React from 'react';
import { Group, Publisher, PublisherActivityStatus } from '../types';
import __noop from '@atlaskit/ds-lib/noop';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import { Link } from 'react-router-dom';
import { getPublisherName } from './util';

interface Props {
  publisher: Publisher;
  group?: Group;
}

export function PublisherViewBreadCrumbs({ publisher, group }: Props) {
  return (
    <Breadcrumbs onExpand={__noop}>
      {publisher?.isRegularPioneer &&
        publisher?.activityStatus !== PublisherActivityStatus.Inactive && (
          <BreadcrumbsItem
            text={'Pionniers'}
            key="Pionners"
            component={() => (
              <Link to={'/groups/pioneers'} replace={true}>
                Pionniers
              </Link>
            )}
          />
        )}
      {!publisher?.isRegularPioneer &&
        publisher?.activityStatus === PublisherActivityStatus.Inactive && (
          <BreadcrumbsItem
            text={'Inactifs'}
            key="Inactives"
            component={() => (
              <Link to={'/groups/inactives'} replace={true}>
                Inactifs
              </Link>
            )}
          />
        )}
      {publisher?.activityStatus !== PublisherActivityStatus.Inactive &&
        !publisher?.isRegularPioneer && (
          <BreadcrumbsItem
            text={group?.name || 'Non affilié'}
            key="Group"
            component={() => (
              <Link to={`/groups/${group?.id || 'unafiliated'}`} replace={true}>
                {group?.name || 'Non affilié'}
              </Link>
            )}
          />
        )}
      <BreadcrumbsItem
        text={getPublisherName(publisher)}
        key="Publisher"
        href="javascript:void(0)"
      />
    </Breadcrumbs>
  );
}
