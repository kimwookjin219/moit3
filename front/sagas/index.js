import { all, fork } from "redux-saga/effects";

import userSaga from "./userSaga";
import meetupSaga from "./meetupSaga";
///// 추가되는 saga ////////
import advertiseSaga from "./advertiseSaga";
import reviewSaga from "./reviewSaga";
import reportSaga from "./reportSaga";
import commonSaga from "./commonSaga";
import qnaSaga from "./qnaSaga";
import advertiseDashboardSaga from "./advertiseDashboardSaga";

export default function* rootSaga() {
    yield all([
        fork(userSaga),
        fork(meetupSaga),
        ///// 추가되는 saga ////////
        fork(advertiseSaga),
        fork(advertiseDashboardSaga),
        fork(reviewSaga),
        fork(reportSaga),
        fork(commonSaga),
        fork(qnaSaga),
    ]);
}
