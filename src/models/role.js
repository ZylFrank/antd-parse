import { getRoleList } from '@/services/role';

export default {
  namespace: 'role',
  state: {
    loading: false,
    modalVisible: false,
    isEdit: false,
    editRoleInfo: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getRoleList, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
