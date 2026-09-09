import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  // HttpOnly Cookie를 서버와 주고받기 위해 필요
  withCredentials: true,
});


// =========================================================
// Device ID 가져오기
// =========================================================
function getDeviceId() {

  if (typeof window === "undefined") {
    return null;
  }

  let deviceId = localStorage.getItem("deviceId");

  // 최초 접속이면 Device ID 생성
  if (!deviceId) {
      if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
      ) {
        deviceId = window.crypto.randomUUID();
      } else {
        deviceId =
          "device-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substring(2, 11);
      }

      localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
}


// =========================================================
// JWT Access Token + Device ID 자동 첨부
// =========================================================
api.interceptors.request.use(

  (config) => {

    if (typeof window !== "undefined") {

      // =====================================================
      // Access Token
      // =====================================================
      const accessToken =
        localStorage.getItem("accessToken");


      // 로그인/회원가입 요청에는 Access Token을 붙이지 않음
      const isLoginRequest =
        config.url === "/api/members/login";

      const isSignupRequest =
        config.url === "/api/members/signup";

      // Refresh 요청에도 기존 Access Token을 굳이 붙이지 않음
      const isRefreshRequest =
        config.url?.includes("/api/members/refresh");


      if (
        accessToken &&
        !isLoginRequest &&
        !isSignupRequest &&
        !isRefreshRequest
      ) {

        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }


      // =====================================================
      // Device ID
      // =====================================================
      const deviceId =
        localStorage.getItem("deviceId");

      if (deviceId) {

        config.headers["X-Device-Id"] =
          deviceId;
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// JWT Access Token 만료 처리
// =========================================================
api.interceptors.response.use(

  (response) => {
    return response;
  },


  async (error) => {

    const originalRequest =
      error.config;

    const status =
      error.response?.status;


    // =====================================================
    // 401이 아닌 경우
    // =====================================================
    if (status !== 401) {
      return Promise.reject(error);
    }


    // =====================================================
    // 로그인 / 로그아웃 요청은 Refresh 대상이 아님
    // =====================================================
    if (
      originalRequest?.url ===
        "/api/members/login" ||

      originalRequest?.url ===
        "/api/members/logout"
    ) {

      return Promise.reject(error);
    }


    // =====================================================
    // Refresh 요청 자체가 실패한 경우
    // =====================================================
    if (
      originalRequest?.url?.includes(
        "/api/members/refresh"
      )
    ) {

      return Promise.reject(error);
    }


    // =====================================================
    // 이미 재시도한 요청
    // =====================================================
    if (originalRequest?._retry) {

      return Promise.reject(error);
    }

    originalRequest._retry = true;


    try {

      // ===================================================
      // Device ID
      // ===================================================
      const deviceId =
        getDeviceId();


      // ===================================================
      // Refresh Token
      //
      // 중요:
      // Refresh Token은 localStorage에서 가져오지 않는다.
      //
      // HttpOnly Cookie이기 때문에 브라우저가
      // withCredentials: true를 통해 자동으로 전송한다.
      // ===================================================
      const response =
        await axios.post(
          "/api/members/refresh",

          {
            deviceId: deviceId,
          },

          {
            withCredentials: true,

            headers: {
              "Content-Type": "application/json",

              Accept:
                "application/json",

              ...(deviceId && {
                "X-Device-Id":
                  deviceId,
              }),
            },
          }
        );


      // ===================================================
      // 새로운 Access Token
      // ===================================================
      const newAccessToken =
        response.data?.accessToken;


      if (!newAccessToken) {

        throw new Error(
          "새로운 Access Token이 없습니다."
        );
      }


      // ===================================================
      // Access Token 저장
      // ===================================================
      if (
        typeof window !== "undefined"
      ) {

        localStorage.setItem(
          "accessToken",
          newAccessToken
        );
      }


      // ===================================================
      // 원래 요청에 새로운 Access Token 적용
      // ===================================================
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      // ===================================================
      // 원래 요청에 Device ID 적용
      // ===================================================
      if (deviceId) {

        originalRequest.headers[
          "X-Device-Id"
        ] = deviceId;
      }


      // ===================================================
      // 원래 요청 재실행
      // ===================================================
      return api(
        originalRequest
      );


    } catch (refreshError) {

      console.error(
        "Access Token 재발급 실패:",
        refreshError
      );


      if (
        typeof window !== "undefined"
      ) {

        // Access Token만 삭제
        localStorage.removeItem(
          "accessToken"
        );

        // Social Login에서 저장된 Refresh Token 삭제
        localStorage.removeItem(
          "refreshToken"
        );

        // Device ID 삭제
        localStorage.removeItem(
          "deviceId"
        );

        // Refresh Token은 HttpOnly Cookie이므로
        // JavaScript에서 삭제하지 않는다.
        //
        // 서버의 logout API에서 Cookie를 삭제해야 한다.

        window.location.href =
          "/user/member/login";
      }


      return Promise.reject(
        refreshError
      );
    }
  }
);


export default api;