import { queryList } from '../services/userList';

export default {
  namespace: 'userList',

  state: {
    isEdit: false,
    modalVisible: false,
    loading: true,
    editInfo: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
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

  //   subscriptions: {
  //     setup({ history }) {
  //       return history.listen(({ pathname, search }) => {
  //       });
  //     },
  //   },
};
