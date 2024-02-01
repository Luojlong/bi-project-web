import Footer from '@/components/Footer';
import { Question } from '@/components/RightContent';
import { getLoginUserUsingGet } from '@/services/BI/userController';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { notification } from 'antd';
import { useEffect } from 'react';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import { errorConfig } from './requestConfig';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  currentUser?: API.LoginUserVO;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await getLoginUserUsingGet();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      currentUser,
    };
  }
  return {};
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // 初始化 WebSocket 连接
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const clientId = Math.random().toString(36);
    const newSocket = new WebSocket('ws://localhost:8101/api/ws/' + clientId);
    newSocket.onopen = () => {
      console.log('WebSocket已连接');
    };
    newSocket.onmessage = (event) => {
      if (event.data === '图表生成好啦，快去看看吧！') {
        notification.success({
          message: event.data,
          duration: 2,
        });
        // 获取当前路径
        const currentPath = history.location.pathname;
        if (currentPath === '/mychart') {
          // 刷新当前路径
          window.location.reload();
        }
      } else {
        notification.error({
          message: event.data, // 你可以根据实际情况设置错误消息
          duration: 2,
        });
      }
    };
    newSocket.onclose = (event) => {
      console.log('WebSocket已关闭：', event);
      // 可以根据需要重新连接或处理关闭
    };

    // 将新的 socket 设置到 initialState 中
    setInitialState((preInitialState) => ({
      ...preInitialState,
      socket: newSocket,
    }));

    // 当组件卸载时清理 WebSocket 连接
    return () => {
      if (
        newSocket.readyState === WebSocket.OPEN ||
        newSocket.readyState === WebSocket.CONNECTING
      ) {
        newSocket.close();
      }
    };
  }, []);

  // @ts-ignore
  return {
    actionsRender: () => [<Question key="doc" />],
    avatarProps: {
      src: initialState?.currentUser?.userAvatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={defaultSettings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...defaultSettings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  baseURL: 'http://localhost:8101',
  withCredentials: true,
  ...errorConfig,
};
