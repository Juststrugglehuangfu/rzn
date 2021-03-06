
import { queryMyrooms, saveRoom, updateMyroom, deleteMyroom, findContracts, queryRoomList } from '@/services/api';
export default {
  namespace: 'mychatroom',

  state: {
    loading: false,
    data: {
      list: [],
      pagination: {
        current: 1,
        pageSize: 10
      },
    },
  },

  effects: {
    *add({ payload, success, fail }, { call }) {
      console.log("2222", payload)
      payload.white_id = 1
      let formData = new FormData()
      Object.keys(payload).forEach((key) => {
        if (payload[key]) {
          formData.append(key, payload[key])
        }
      });
      console.log("4444", formData)
      let response = yield call(saveRoom, formData)
      console.log("5555", response)
      if (response.code) {
        response = response || {}
        console.log(" saveRoom  fail==", response)
        if (fail && typeof fail === 'function') {
          fail(response.msg || '');
        }
      }
      else {
        if (success && typeof success === 'function') {
          success();
        }
      }
    },
    *fetchMyList({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      let response = {}
      console.log("fetchMyList  payload== ", payload)
      console.log("fetchMyList  payload.contract_stu != == ", payload.contract_stu != "")
      payload.sortName = "room_id"
      response = yield call(queryRoomList, payload);
      // console.log("room  fetch response===", response)
      if (!response.code) {
        var result = {
          list: response.rows,
          pagination: {
            total: response.total
          },
        }
        yield put({
          type: 'save',
          payload: result,
        });
        yield put({
          type: 'changeLoading',
          payload: false,
        });
      }
    },



  },
  reducers: {
    save(state, action) {
      // console.log("action==", action)
      return {
        ...state,
        data: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload
      };
    },
  },
};
