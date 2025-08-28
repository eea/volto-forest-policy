import React from 'react';
import { Label } from 'semantic-ui-react';
import { StringList, DateTime } from '@eeacms/search/components';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { firstWords, getTermDisplayValue } from '@eeacms/search/lib/utils';

import ExternalLink from '@eeacms/search/components/Result/ExternalLink';
import ResultContext from '@eeacms/search/components/Result/ResultContext';
import ContentClusters from '@eeacms/search/components/Result/ContentClusters';
import { FormattedMessage } from 'react-intl';

const ExtraContent = (props) => {
  const { result, vocab } = props;
  return (
    <div>
      <div className="result-bottom">
        <div className="result-info">
          <DateTime format="DATE_MED" value={result.issued} />
        </div>
        <div className="result-info">
          <span className="result-info-title">
            <FormattedMessage id="Topics:" defaultMessage="Topics:" />{' '}
          </span>
          <StringList value={result.tags} />
        </div>
      </div>
    </div>
  );
};

const FiseCardItem = (props) => {
  const { result } = props;
  const { appConfig, registry } = useAppConfig();
  const { vocab = {} } = appConfig;
  const clusters = result.clusterInfo;

  const UniversalCard = registry.resolve['UniversalCard'].component;

  const item = {
    '@id': result.href,
    title: (
      <>
        <ExternalLink href={result.href} title={result.title}>
          {result.title}
          {result.isNew && <Label className="new-item">New</Label>}
          {result.isExpired && (
            <Label className="archived-item">Archived</Label>
          )}
        </ExternalLink>
      </>
    ),
    meta: <ContentClusters clusters={clusters} item={result} />,
    description: props.children ? props.children : <ResultContext {...props} />,
    preview_image_url: result.hasImage ? result.thumbUrl : undefined,
    extra: <ExtraContent result={result} vocab={vocab} />,
  };

  const itemModel = {
    hasImage: result.hasImage,
    hasDescription: true,
    imageOnRightSide: true,
    '@type': 'searchItem',
  };

  return <UniversalCard item={item} itemModel={itemModel} />;
};

export default FiseCardItem;
