/* eslint-disable react/no-danger */
import React from 'react';
import { Helmet } from 'react-helmet';

const ZEEVES_HOST = process.env.ZEEVES_HOST || 'zeeves.io';

const Zeeves = () => {
  return (
    <Helmet>
        {/* Zeeves SDK */}
        <script src={`https://${ZEEVES_HOST}/sdk/sdk.min.js?ts=${new Date().getTime().toString()}`}></script>
    </Helmet>
  );
};

export default Zeeves;
