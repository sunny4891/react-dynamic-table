import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
} from "./tableSlice";
import { fetchUsers } from "../services/api";

// Worker Saga
function* fetchUsersSaga(action) {
  try {
    const { page, rowsPerPage, search, sortBy, order } = action.payload;

    const response = yield call(fetchUsers, {
      page,
      limit: rowsPerPage,
      search,
      sortBy,
      order,
    });

    yield put(fetchUsersSuccess(response));
  } catch (error) {
    yield put(fetchUsersFailure(error.toString()));
  }
}

// Watcher Saga
function* watchUsers() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersSaga);
}

// Root Saga
export default function* rootSaga() {
  yield watchUsers();
}
