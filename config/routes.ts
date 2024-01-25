export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  {
    path: '/user',
    layout: false,
    routes: [{ path: '/user/register', component: './User/Register' }],
  },
  { path: '/', redirect: '/chart' },
  { path: '/chart', name: '数据分析', icon: 'DotChartOutlined', component: './AddChart' },
  { path: '/chartasync', name: '批量分析', icon: 'BoxPlotOutlined', component: './AddChartAsync' },
  { path: '/mychart', name: '我的图表', icon: 'UnorderedListOutlined', component: './MyChart' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
