import { queryList, createUser, getUserItem, updateUser } from '../services/userList';

export default {
  namespace: 'userList',

  state: {
    isEdit: false,
    modalVisible: false,
    loading: true,
    userInfo: {},
    userRoles: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *addItem({ payload }, { call, put }) {
      yield call(createUser, payload);
      yield put({
        type: 'fetch',
      });
    },
    *updateItem({ payload }, { call, put }) {
      const { id, editingUserRoles, values } = payload;
      yield call(updateUser, { id, roles: editingUserRoles.map(item => item.id), values });
      yield put({
        type: 'fetch',
      });
    },

    *getItem({ payload }, { call, put }) {
      const { user, roles } = yield call(getUserItem, payload);
      yield put({
        type: 'save',
        payload: {
          userInfo: user.toJSON(),
          userRoles: roles,
        },
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
