// utils/fetchWithAuth.ts

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include', // 쿠키 포함 필수
  });

  // 액세스 토큰 만료 시
  if (res.status === 401) {
    const refreshRes = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // 리프레시 성공했으면 요청 한 번 더 시도
      return await fetch(input, {
        ...init,
        credentials: 'include',
      });
    } else {
      // 리프레시 실패 → 완전한 로그아웃 처리
      throw new Error('인증 만료: 다시 로그인하세요.');
    }
  }

  return res;
}
