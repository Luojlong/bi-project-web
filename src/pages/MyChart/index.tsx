import { listChartByPageUsingPOST } from '@/services/BI/chartController';

import { Card, message, Result, Tag } from 'antd';
import Search from 'antd/es/input/Search';
import List from 'antd/lib/list';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

const MyChart: React.FC = () => {
  const initSearchParams = { pageSize: 12, current: 1 };
  // 发送后端的查询条件
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  // 存储后端发来的图表数据
  const [chartList, setChartList] = useState<API.Chart[]>();
  // 总的数据数
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listChartByPageUsingPOST(searchParams);
      if (res.data) {
        // 拿到分页的数据
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        if (res.data.records) {
          res.data.records.forEach((data) => {
            const chartOption = JSON.parse(data.genChart ?? '{}');
            if (chartOption.title) chartOption.title = undefined;
            data.genChart = JSON.stringify(chartOption);
          });
        }
      } else message.error('获取图表失败');
    } catch (e: any) {
      message.error('获取我的图表失败' + e.message);
    }
    setLoading(false);
  };

  // react的钩子函数，页面首次渲染或该数组变动执行该代码
  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    <div className={'my-chart'}>
      <Search
        placeholder={'请输入图表名称'}
        loading={loading}
        enterButton
        onSearch={(value) => {
          setSearchParams({
            ...initSearchParams,
            name: value,
          });
        }}
      ></Search>
      <div style={{ marginBottom: 16 }} />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 4,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card title={item.name} style={{ height: 600 }}>
              {item.status === 'succeed' && (
                <>
                  <Tag color="volcano">分析目标</Tag>
                  {'' + item.goal}
                  <div style={{ marginBottom: 12 }}></div>
                  <Tag color="cyan">分析结论</Tag>
                  {'' + item.genResult}
                  <div style={{ marginBottom: 12 }}></div>
                  <Tag color="magenta">{item.chartType ? item.chartType : undefined}</Tag>
                  <ReactECharts option={JSON.parse(item.genChart ?? '{}')} />
                </>
              )}
              {item.status === 'failed' && (
                <>
                  <Result
                    status="error"
                    title="图表生成失败"
                    subTitle={item.execMessage}
                    // TODO:添加重试按钮重定位到分析界面
                    // extra={[
                    //   <Button key="buy">Buy Again</Button>,
                    // ]}
                  />
                </>
              )}
              {item.status === 'running' && (
                <>
                  <Result status="info" title="图表生成中" subTitle={item.execMessage} />
                </>
              )}
              {item.status === 'wait' && (
                <>
                  <Result
                    status="warning"
                    title="等待生成"
                    subTitle={item.execMessage ?? '当前用户使用使用较多，请耐心等待'}
                  />
                </>
              )}
            </Card>
          </List.Item>
        )}
      />
      总数：{total}
    </div>
  );
};
// @ts-ignore
export default MyChart;
