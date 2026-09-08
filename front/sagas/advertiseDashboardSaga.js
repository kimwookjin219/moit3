import {
    all,
    call,
    put,
    takeLatest,
} from 'redux-saga/effects';

import {
    getAdvertiseDashboardSummary,
    getAdvertiseDashboardDaily,
    getAdvertiseDashboardCtr,
    getAdvertiseDashboardGrade,
    getAdvertiseDashboardPosition,
    getAdvertiseDashboardExtensionRate,
    getAdvertiseDashboardPositionCtr,
    getAdvertiseDashboardAiSummary,
} from '../api/advertiseDashboardApi';

import {
    getAdvertiseDashboardRequest,
    getAdvertiseDashboardSuccess,
    getAdvertiseDashboardFailure,
} from '../reducers/advertiseDashboardReducer';


// =========================================================
// 대시보드 전체 조회
// =========================================================

export function* getAdvertiseDashboardSaga() {

    try {
        const [
            summaryRes,
            dailyRes,
            ctrRes,
            gradeRes,
            positionRes,
            extensionRes,
            positionCtrRes,
            aiSummaryRes,
        ] = yield all([
            call( getAdvertiseDashboardSummary ),
            call( getAdvertiseDashboardDaily ),
            call( getAdvertiseDashboardCtr ),
            call( getAdvertiseDashboardGrade ),
            call( getAdvertiseDashboardPosition ),
            call( getAdvertiseDashboardExtensionRate ),
            call( getAdvertiseDashboardPositionCtr ),
            call( getAdvertiseDashboardAiSummary ),
        ]);

        console.log('===== 광고 대시보드 API =====');

        console.log('summary:', summaryRes?.data);
        console.log('daily:', dailyRes?.data);
        console.log('ctr:', ctrRes?.data);
        console.log('grade:', gradeRes?.data);
        console.log('position:', positionRes?.data);
        console.log('extension:', extensionRes?.data);
        console.log('positionCtr:', positionCtrRes?.data);
        console.log('aiSummary:', aiSummaryRes?.data);

        yield put(
            getAdvertiseDashboardSuccess({

                summary:
                    summaryRes?.data ?? {},

                dailyData:
                    Array.isArray(dailyRes?.data)
                        ? dailyRes.data
                        : [],

                ctrData:
                    Array.isArray(ctrRes?.data)
                        ? ctrRes.data
                        : [],

                gradeData:
                    Array.isArray(gradeRes?.data)
                        ? gradeRes.data
                        : [],

                positionData:
                    Array.isArray(positionRes?.data)
                        ? positionRes.data
                        : [],

                extensionRate:
                    Number(extensionRes?.data ?? 0),

                positionCtrData:
                    Array.isArray(positionCtrRes?.data)
                        ? positionCtrRes.data
                        : [],

                aiSummary:
                    aiSummaryRes?.data ?? null,
            })
        );

    } catch (error) {

        console.error(
            '===== 광고 대시보드 API 실패 ====='
        );

        console.error(
            'status:',
            error.response?.status
        );

        console.error(
            'url:',
            error.config?.url
        );

        console.error(
            'data:',
            error.response?.data
        );

        console.error(
            'message:',
            error.message
        );

        yield put(
            getAdvertiseDashboardFailure(
                error.response?.data ||
                '광고 대시보드 조회 실패'
            )
        );
    }
}

// =========================================================
// Watcher
// =========================================================

export function* watchAdvertiseDashboard() {

    yield takeLatest(
        getAdvertiseDashboardRequest.type,
        getAdvertiseDashboardSaga
    );
}

// =========================================================
// Dashboard Saga
// =========================================================

export default function* advertiseDashboardSaga() {

    yield all([
        watchAdvertiseDashboard()
    ]);
}