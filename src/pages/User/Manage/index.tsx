import {
  checkInUsingPost,
  getSignByIdUsingGet,
  getUserByIdUsingGet,
} from '@/services/BI/scoreController';
import { getLoginUserUsingGet, updateMyUserUsingPost } from '@/services/BI/userController';

import { CheckCircleTwoTone } from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, Modal, message } from 'antd';
import { useEffect, useState } from 'react';

const UserProfile = () => {
  const [form] = Form.useForm();
  const [isSignedIn, setSignedIn] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<API.BaseResponseLoginUserVO_>();
  const [score, setScore] = useState<API.BaseResponseLong_>();
  const [signStatus, setSignStatus] = useState<API.BaseResponseInt_>();
  const fetchData = async () => {
    try {
      const [userRes, scoreRes, signRes] = await Promise.all([
        getLoginUserUsingGet(),
        getUserByIdUsingGet(),
        getSignByIdUsingGet(),
      ]);
      if (userRes.data) {
        setUserData(userRes);
      } else {
        message.error(userRes.message);
      }

      if (signRes.hasOwnProperty('data')) {
        setSignStatus(signRes);
        console.log(signRes);
      } else {
        message.error(signRes.message);
      }

      if (scoreRes.data) {
        setScore(scoreRes);
      } else {
        message.error(scoreRes.message);
      }
    } catch (e) {
      console.log(e);
      message.error('获取信息失败');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 签到逻辑
   */
  const handleSignIn = async () => {
    const res = await checkInUsingPost();
    if (res.data === '签到成功') {
      setSignedIn(true);
      message.success(res.data);
      fetchData();
    } else {
      message.error(res.message);
      setSignedIn(false);
    }
  };
  const handleRecharge = () => {
    message.info('你还真想充钱呀，直接打给我吧！！！');
  };

  const handleEditProfile = () => {
    setModalVisible(true);
    form.setFieldsValue({ userName: userData?.data?.userName });
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUserInfo: API.UserUpdateMyRequest = {
        userName: form.getFieldValue('userName'),
      };
      const updateUserInfo = await updateMyUserUsingPost(updatedUserInfo);

      if (updateUserInfo.data) {
        message.success('保存成功！');
        fetchData(); // 获取最新的用户信息和积分
        setModalVisible(false);
      } else {
        message.error(updateUserInfo.message);
      }
    } catch (e) {
      console.log(e);
      message.error('信息保存失败');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: '100vh',
        paddingLeft: '20px',
        paddingTop: '20px',
      }}
    >
      <Card style={{ width: '100%', textAlign: 'center', padding: 20 }}>
        <Avatar size={80} src={userData?.data?.userAvatar} />
        <h2 style={{ fontSize: 24 }}>{userData?.data?.userName}</h2>
        <p style={{ fontSize: 18 }}>积分：{score?.data}</p>
        <Button
          type="primary"
          size="large"
          onClick={handleSignIn}
          disabled={signStatus?.data !== 0 || isSignedIn}
          style={{ fontSize: 18, width: 90, marginRight: 10 }}
        >
          <>
            {signStatus?.data !== 0 || isSignedIn ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
            ) : (
              '签到'
            )}
          </>
        </Button>
        <Button style={{ marginTop: 10, fontSize: 18 }} size="large" onClick={handleRecharge}>
          充值积分
        </Button>
        <div style={{ display: 'block' }}>
          <Button style={{ marginTop: 10, fontSize: 18 }} size="large" onClick={handleEditProfile}>
            编辑个人信息
          </Button>
        </div>
      </Card>

      <Modal
        title="编辑个人信息"
        open={isModalVisible}
        onOk={handleSaveProfile}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="昵称" name="userName">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
