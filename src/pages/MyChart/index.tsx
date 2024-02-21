import {
  listMyChartByPageUsingPOST,
  retryGenChartByAiAsyncMqUsingGet,
} from '@/services/BI/chartController';
import { getUserByIdUsingGet } from '@/services/BI/scoreController';
import { AlignRightOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Result, Space, Tag, message } from 'antd';
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
  // 是否重试
  const [retrying, setRetrying] = useState(false);
  // 数据图标
  const [modalStatus, setModalStatus] = useState<{ [key: number]: boolean }>({});
  // 输入框状态
  const [searchValue, setSearchValue] = useState('');
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        // 拿到分页的数据
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        if (res.data.records) {
          res.data.records.forEach((data) => {
            const chartOption = JSON.parse(data.genChart || '{}');
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
  const refresh = () => {
    loadData();
  };
  // react的钩子函数，页面首次渲染或该数组变动执行该代码
  useEffect(() => {
    loadData();
  }, [searchParams]);
  const showModal = (itemId: number) => {
    setModalStatus({ ...modalStatus, [itemId]: true });
  };

  const hideModal = (itemId: number) => {
    setModalStatus({ ...modalStatus, [itemId]: false });
  };

  const retry = async (id: number) => {
    if (retrying) {
      return; // 如果正在重试中，直接返回，不执行后续操作
    }
    setRetrying(true);
    const scoreRes = await getUserByIdUsingGet();
    // @ts-ignore
    if (scoreRes.data < 1) {
      message.error('积分不足，要坚持签到哦或者联系小罗同学');
    } else {
      const res = await retryGenChartByAiAsyncMqUsingGet({ id });
      if (!res?.data) {
        message.error('分析失败', 2);
      } else {
        message.success('重试分析任务提交成功，请稍后查看，可刷新查看状态', 2);
      }
    }
  };
  return (
    <div className={'my-chart'}>
      <Space>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => refresh()}></Button>
        <Search
          placeholder={'支持查询：图表名称、图表类型、分析目标'}
          loading={loading}
          enterButton
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (!e.target.value) {
              refresh();
            }
          }}
          onPressEnter={(e) => {
            setSearchParams({
              ...initSearchParams,
              name: e.target.value,
              chartType: e.target.value,
              goal: e.target.value,
            });
            loadData();
          }}
          onSearch={(value) => {
            setSearchParams({
              ...initSearchParams,
              name: value,
              chartType: value,
              goal: value,
            });
            loadData();
          }}
          style={{ width: 600 }}
        ></Search>
      </Space>
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
            <Card
              title={
                <span
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{item.name}</span>
                  <span>
                    <Button
                      icon={<AlignRightOutlined />}
                      onClick={() => showModal(item.id)}
                      style={{ boxShadow: 'none', border: 'none' }}
                    ></Button>
                    <Modal
                      title="原始数据"
                      open={modalStatus[item.id]}
                      onOk={() => hideModal(item.id)}
                      onCancel={() => hideModal(item.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      {item.chartData.split('\n').map((dataSegment, index) => (
                        <div key={index} style={{ marginBottom: 8 }}>
                          {dataSegment}
                        </div>
                      ))}
                    </Modal>
                  </span>
                </span>
              }
            >
              {item.status === 'succeed' && (
                <>
                  <Tag color="volcano">分析目标</Tag>
                  {'' + item.goal}
                  <div style={{ marginBottom: 12 }}></div>
                  <Tag color="cyan">分析结论</Tag>
                  {'' + item.genResult}
                  <div style={{ marginBottom: 12 }}></div>
                  <Tag color="magenta">{item.chartType ? item.chartType : undefined}</Tag>
                  <ReactECharts option={JSON.parse(item.genChart || '{}')} />
                </>
              )}
              {item.status === 'failed' && (
                <>
                  <Result
                    status="error"
                    title="图表生成失败"
                    subTitle={item.execMessage}
                    extra={[
                      <Button
                        key="retry"
                        type="primary"
                        onClick={() => item.id && retry(item.id)}
                        size={'large'}
                        disabled={retrying}
                        style={{ fontFamily: 'Noto Color Emoji', fontSize: 18 }}
                      >
                        {retrying ? '重试中...' : '重试'}
                      </Button>,
                    ]}
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
