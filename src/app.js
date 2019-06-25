import { message } from 'antd';
import Parse from './utils/parse';

const errorHandler = (error, dispatch) => {
  const errorCode = error.code || error.status;
  switch (errorCode) {
    case Parse.Error.CONNECTION_FAILED:
      message.error('连接失败, 请检查您的网络或联系管理员');
      break;
    case Parse.Error.TIMEOUT:
      message.error('连接超时, 请检查您的网络或联系管理员');
      break;
    case Parse.Error.OBJECT_NOT_FOUND:
      message.error('对不起, 数据不存在或者您没有权限');
      break;
    case Parse.Error.FILE_TOO_LARGE:
    case 413:
      message.error(`上传文件体积太大`);
      break;
    case Parse.Error.REQUEST_LIMIT_EXCEEDED:
      message.error('请求次数过多, 请稍后再试或联系管理员');
      break;
    case 601:
    case 610:
      message.error('文件导出服务出错, 请检查模板格式并重试或联系管理员');
      break;
    case 602:
    case 603:
    case 604:
    case 605:
    case 606:
      message.error('文件导入服务出错, 请检查文件格式并重试或联系管理员');
      break;
    case Parse.Error.USERNAME_TAKEN:
      message.error('该用户名已被注册');
      break;
    case Parse.Error.EMAIL_TAKEN:
      message.error('该邮箱已被注册');
      break;
    case Parse.Error.INVALID_SESSION_TOKEN:
      dispatch({
        type: 'login/logout',
      });
      break;
    default:
      message.error(error.message || '系统繁忙, 请联系管理员');
  }
};

export const dva = {
  config: {
    onError(err) {
      errorHandler(err);
    },
  },
};

export function render(oldRender) {
  oldRender();
}
