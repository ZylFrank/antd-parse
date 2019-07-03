import { getRoleList, create, update, remove } from '@/services/role';

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
      yield put({
        type: 'save',
        payload: {
          loading: true,
        },
      });
      const response = yield call(getRoleList, payload);
      yield put({
        type: 'save',
        payload: {
          ...response,
          loading: false,
        },
      });
    },
    *create({ payload }, { call, put }) {
      yield call(create, payload);
      yield put({
        type: 'fetch',
      });
    },
    *update({ payload }, { call, put }) {
      yield call(update, payload);
      yield put({
        type: 'fetch',
      });
    },
    *remove({ payload }, { call, put }) {
      yield call(remove, payload);
      yield put({
        type: 'fetch',
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
