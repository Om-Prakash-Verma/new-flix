
'use client';

import React from 'react';
// We are using next/dist/client/link to avoid a circular dependency
import NextLink, { type LinkProps } from 'next/dist/client/link';

const NoPrefetchLink = (props: LinkProps & { children: React.ReactNode }) => {
  return <NextLink {...props} prefetch={false} />;
};

export default NoPrefetchLink;
