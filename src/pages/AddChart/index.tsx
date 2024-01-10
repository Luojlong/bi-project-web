import { genChartByAiUsingPost } from '@/services/BI/chartController';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  message,
  Row,
  Space,
  Spin,
  TreeSelect,
  Upload,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [option, setOption] = useState<any>();
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) return;
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);
    const params = {
      ...values,
      file: undefined,
    };

    try {
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误');
        } else {
          setChart(res?.data);
          setOption(chartOption);
        }
      }
    } catch (e: any) {
      message.error('分析失败', e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className={'chart'}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title={'分析设置'}>
            <Form name="addChart" onFinish={onFinish} initialValues={{}} labelAlign={'left'}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求。若图表类型不存在你想要的分析类型，可在此处添加" />
              </Form.Item>
              <Form.Item name="name" label="图表名称">
                <input placeholder="请输入图表名称" />
              </Form.Item>
              <Form.Item name="chartType" label="图表类型">
                <TreeSelect
                  treeData={[
                    {
                      title: '对比类',
                      value: '对比类',
                      children: [
                        { title: '柱形图', value: '柱形图' },
                        { title: '对比柱形图', value: '对比柱形图' },
                        { title: '分组柱形图', value: '分组柱形图' },
                        { title: '堆叠柱形图', value: '堆叠柱形图' },
                        { title: '折线图', value: '折线图' },
                        { title: '分区折线图', value: '分区折线图' },
                        { title: '雷达图', value: '雷达图' },
                        { title: '词云', value: '词云' },
                        { title: '聚合气泡图', value: '聚合气泡图' },
                      ],
                    },
                    {
                      title: '占比类',
                      value: '占比类',
                      children: [
                        { title: '饼图', value: '饼图' },
                        { title: '矩形块图', value: '矩形块图' },
                        { title: '百分比堆积柱形图', value: '百分比堆积柱形图' },
                        { title: '多层饼图', value: '多层饼图' },
                        { title: '仪表盘', value: '仪表盘' },
                      ],
                    },
                    {
                      title: '趋势关联类',
                      value: '趋势关联类',
                      children: [
                        { title: '折线图', value: '折线图' },
                        { title: '面积图', value: '面积图' },
                        { title: '范围面积图', value: '范围面积图' },
                        { title: '瀑布图', value: '瀑布图' },
                      ],
                    },
                    {
                      title: '分布类',
                      value: '分布类',
                      children: [
                        { title: '散点图', value: '散点图' },
                        { title: '热力区域图', value: '热力区域图' },
                        { title: '漏斗图', value: '漏斗图' },
                      ],
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item name="file" label="原始数据">
                <Upload name="file" maxCount={1}>
                  <button style={{ border: 0, background: 'none' }} type="button">
                    <PlusOutlined />
                    <div style={{ marginTop: 3 }}>上传 Excel 文件</div>
                  </button>
                </Upload>
              </Form.Item>
              <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    disabled={submitting}
                  >
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={'分析结论'}>
            {chart?.genResult ?? <div></div>}
            <Spin spinning={submitting}></Spin>
          </Card>
          <Divider></Divider>
          <Card title={'图表展示'}>
            {option ? <ReactECharts option={option} /> : <div></div>}
            <Spin spinning={submitting}></Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AddChart;