import React from 'react';

const ClassicPortlet = ({ portlet }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: portlet.classicportlet || '',
      }}
    />
  );
};

export default ClassicPortlet;
