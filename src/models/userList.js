import qs from 'qs';
import { queryList, createUser, getUserItem, updateUser } from '../services/userList';

export default {
  namespace: 'userList',

  state: {
    isEdit: false,
    modalVisible: false,
    loading: true,
    userInfo: {},
    userRoles: [],
    query: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          query: payload,
          loading: true,
        },
      });
      const response = yield call(queryList, payload);
      yield put({
        type: 'save',
        payload: {
          ...response,
          loading: false,
        },
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

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === '/system/user') {
          dispatch({
            type: 'fetch',
            payload: {
              ...qs.parse(search, { ignoreQueryPrefix: true }),
            },
          });
        }
      });
    },
  },
};
