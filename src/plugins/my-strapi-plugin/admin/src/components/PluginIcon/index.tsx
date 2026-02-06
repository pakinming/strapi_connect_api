import React from 'react';
import { Flex } from '@strapi/design-system';

const PluginIcon = () => (
    <Flex
        justifyContent="center"
        alignItems="center"
        width={7}
        height={7}
        hasRadius
        background="primary100"
    >
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="#4945FF"
            />
            <path
                d="M2 17L12 22L22 17"
                stroke="#4945FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2 12L12 17L22 12"
                stroke="#4945FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </Flex>
);

export default PluginIcon;
