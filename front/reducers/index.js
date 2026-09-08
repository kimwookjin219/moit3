import { combineReducers } from "@reduxjs/toolkit"; // 여러 리듀서를 하나로 합쳐주는 함수
import userReducer from "./userReducer";
import meetupReducer from "./meetupReducer";
import reportReducer from "./reportReducer";
import advertiseReducer from "./advertiseReducer";
import qnaReducer from "./qnaReducer";
import commonReducer from "./commonReducer";
import reviewReducer from "./reviewReducer";
import advertiseDashboardReducer from "./advertiseDashboardReducer";

const rootReducer = combineReducers({
    user: userReducer, //state.user
    meetup: meetupReducer,
    report: reportReducer,
    advertise: advertiseReducer,
    advertiseDashboard: advertiseDashboardReducer,
    qna: qnaReducer,
    review: reviewReducer,
    common: commonReducer,
});

export default rootReducer;