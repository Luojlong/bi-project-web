import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const Footer: React.FC = () => {
  const defaultMessage = 'JL';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'BI 平台',
          title: 'BI 平台',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'gitee',
          title: <GithubOutlined />,
          href: 'https://gitee.com/jlongluo',
          blankTarget: true,
        },
        {
          key: 'BI 平台',
          title: 'BI 平台',
          href: 'https://ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
