/**
 * Document view component.
 * @module components/theme/View/CollectionView
 */

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from '@plone/volto/helpers';
import { getContent } from '@plone/volto/actions';
import { Pagination } from 'semantic-ui-react';
import Item from './Item';

import './style.less';

/**
 * List view component class.
 * @function CollectionView
 * @params {object} content Content object.
 * @returns {string} Markup of the component.
 */
const CollectionView = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const dispatch = useDispatch();
  const { content, location } = props;
  const items = content.items;
  const totalItems = content.items_total;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  // const pageSizes = [25, 50, 100];

  useEffect(() => {
    dispatch(
      getContent(location.pathname, null, null, null, true, {
        b_start: (currentPage - 1) * itemsPerPage,
        b_size: itemsPerPage,
      }),
    );
    /* eslint-disable-next-line */
  }, [currentPage, itemsPerPage]);

  return (
    <React.Fragment>
      <Helmet title={content.title} />
      <h1 className="documentFirstHeading">
        {content.title}
        {content.subtitle && ` - ${content.subtitle}`}
      </h1>
      {content.description && (
        <p className="documentDescription">{content.description}</p>
      )}

      {items?.length ? (
        <div className="collection">
          {items.map((item, index) => (
            <Item key={item.id} item={item} />
          ))}
          <Pagination
            current={currentPage}
            totalPages={totalPages}
            prevItem={null}
            nextItem={null}
            firstItem={
              currentPage > 1
                ? {
                    'aria-label': 'First item',
                    content: '«',
                  }
                : null
            }
            lastItem={
              currentPage < totalPages
                ? {
                    'aria-label': 'Last item',
                    content: '»',
                  }
                : null
            }
            onPageChange={(_, data) => {
              setCurrentPage(data.activePage);
            }}
          />
        </div>
      ) : (
        ''
      )}
    </React.Fragment>
  );
};

export default CollectionView;
