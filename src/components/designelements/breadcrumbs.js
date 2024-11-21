import * as React from 'react';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import PropTypes from 'prop-types';

export default function BasicBreadcrumbs({ breadcrumbs }) {
  return (
    <Breadcrumbs aria-label="breadcrumbs">
      {breadcrumbs.slice(0, -1).map((item) => (
        <Link 
          key={item.label} 
          color="neutral" 
          href={item.url} // Use the provided URL for navigation
        >
          {item.label}
        </Link>
      ))}
      <Typography>{breadcrumbs[breadcrumbs.length - 1].label}</Typography>
    </Breadcrumbs>
  );
}

BasicBreadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};
