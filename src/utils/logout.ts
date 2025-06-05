// utils/logout.ts

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함 필수
    });
  } catch (error) {
    console.error('로그아웃 요청 실패:', error);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberMe');
}
