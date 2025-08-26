import React from 'react';
import { render } from '@testing-library/react';
import FiseCardItem from './FiseCardItem';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@eeacms/search/lib/hocs', () => ({
  useAppConfig: () => ({
    appConfig: {
      vocab: {},
    },
    registry: {
      resolve: {
        UniversalCard: {
          component: ({ item }) => (
            <div data-testid="universal-card">{item.title}</div>
          ),
        },
      },
    },
  }),
}));

jest.mock('@eeacms/search/components', () => ({
  StringList: ({ value }) => <span>{value.join(', ')}</span>,
  DateTime: ({ value }) => <span>{value}</span>,
}));

jest.mock('@eeacms/search/lib/utils', () => ({
  firstWords: (str) => str,
  getTermDisplayValue: ({ term }) => term,
}));

jest.mock(
  '@eeacms/search/components/Result/ExternalLink',
  () =>
    ({ children, href }) => <a href={href}>{children}</a>,
);

jest.mock('@eeacms/search/components/Result/ResultContext', () => () => (
  <div>ResultContext</div>
));

jest.mock('@eeacms/search/components/Result/ContentClusters', () => () => (
  <div>ContentClusters</div>
));

describe('FiseCardItem', () => {
  it('renders the FiseCardItem component', () => {
    const result = {
      href: 'http://example.com',
      title: 'Test Title',
      isNew: false,
      isExpired: false,
      clusterInfo: {},
      hasImage: false,
      issued: '2025-08-26T10:00:00Z',
      tags: ['tag1', 'tag2'],
    };

    const { getByText } = render(<FiseCardItem result={result} />);
    expect(getByText('Test Title')).toBeInTheDocument();
  });
});
