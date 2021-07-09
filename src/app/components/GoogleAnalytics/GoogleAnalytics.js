/* eslint-disable react/no-danger */
import React from 'react';
import { Helmet } from 'react-helmet';

// eslint-disable-next-line no-undef
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

const GoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <Helmet>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </script>
    </Helmet>
  );
};

export default GoogleAnalytics;
