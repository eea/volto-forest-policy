import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedDate } from 'react-intl';
import { Image } from 'semantic-ui-react';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
  hasBlocksData,
} from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { getBasePath } from '@eeacms/volto-forest-policy/helpers';

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Item = ({ item }) => {
  const blocksFieldname = getBlocksFieldname(item);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(item);
  const parentPath = getBasePath(item['@id']).split('/').slice(0, -1);
  const parentTitle = capitalize(parentPath[parentPath.length - 1]);

  return (
    <div className="item">
      <div className="header">
        <div className="content">
          <Link
            className="headline"
            title={item.title}
            to={getBasePath(item['@id'])}
          >
            <h3>{item.title}</h3>
          </Link>
          <Link title={parentTitle} to={parentPath.join('/')}>
            {parentTitle}
          </Link>
          <div className={'meta-data'}>
            <div className="text-tab">
              <span className="muted">Updated: </span>
              <FormattedDate
                value={item.ModificationDate}
                day="2-digit"
                month="long"
                year="numeric"
              />
            </div>
            {item.effective && !(item.start && item.end) && (
              <div className="text-tab">
                <span className="muted">Published: </span>
                <span>
                  <FormattedDate
                    value={item.effective}
                    day="2-digit"
                    month="long"
                    year="numeric"
                  />
                </span>
              </div>
            )}
            {item.start && item.end && (
              <>
                <div className="text-tab">
                  <span className="muted">Starting: </span>
                  <span>
                    <FormattedDate
                      value={item.start}
                      day="2-digit"
                      month="long"
                      year="numeric"
                    />
                  </span>
                </div>
                <div className="text-tab">
                  <span className="muted">Ending: </span>
                  <span>
                    <FormattedDate
                      value={item.end}
                      day="2-digit"
                      month="long"
                      year="numeric"
                    />
                  </span>
                </div>
              </>
            )}
            {item.location && (
              <div className="text-tab">
                <span className="muted">Location: </span>
                <span>{item.location}</span>
              </div>
            )}
            {item.year && (
              <div className="text-tab">
                <span className="muted">Year: </span>
                <span>{item.year}</span>
              </div>
            )}
          </div>
        </div>
        {item.image && (
          <div className="content">
            <Image
              className="document-image"
              src={item.image.scales.thumb.download}
            />
          </div>
        )}
      </div>
      <div className="content">
        {item.description && (
          <span className="description">{item.description}</span>
        )}
        {hasBlocksData(item) ? (
          <div>
            {item?.[blocksLayoutFieldname]?.items?.map((block) => {
              const Block =
                config.blocks.blocksConfig[
                  item[blocksFieldname]?.[block]?.['@type']
                ]?.['view'] || null;
              return Block !== null &&
                item[blocksFieldname][block]['@type'] !== 'title' ? (
                <Block
                  key={block}
                  id={block}
                  properties={item}
                  data={item[blocksFieldname][block]}
                />
              ) : (
                ''
              );
            })}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default Item;
