import { message } from 'antd';
import { queryList, addItem, updateItem, deletedItem } from '@/services/dictionary';
import DicMap from '@/utils/utils';

export default {
  namespace: 'dictionary',

  state: {
    data: [],
    rawData: [],
    dicMap: new DicMap(),
    modalVisible: false,
    isEdit: false,
    editInfo: {},
    loading: false,
    parent: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const responseList = yield call(queryList);
      const rawData = responseList.map(item => item.toJSON());
      const dicMap = new DicMap(rawData);
      const treeData = dicMap.getTreeData('');
      yield put({
        type: 'save',
        payload: { data: treeData, rawData, dicMap },
      });
    },
    *addItem({ payload }, { call, put }) {
      yield call(addItem, payload);
      message.success('添加成功');
      yield put({
        type: 'fetch',
      });
    },
    *updateItem({ payload }, { call, put }) {
      yield call(updateItem, payload);
      yield put({
        type: 'fetch',
      });
    },
    *deleteItem({ payload }, { call, put }) {
      yield call(deletedItem, payload);
      message.success('删除成功');
      yield put({
        type: 'fetch',
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      dispatch({ type: 'fetch' });
      return history.listen(({ pathname }) => {
        if (pathname === '/system/dictionary') {
          dispatch({
            type: 'fetch',
            payload: {},
          });
        }
      });
    },
  },
};
