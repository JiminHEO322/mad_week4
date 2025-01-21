import { useGoogleLogin } from '@react-oauth/google'

function LoginPage() {
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (response) => {
            console.log('Login Success:', response)
            // 사용자의 Google 프로필 정보 가져오기
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${response.access_token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('User Info:', data);
                    // 로그인 성공 후 처리 (예: 상태 업데이트 또는 페이지 이동)
                });
        },
        onError: () => {
            console.error('Login Failed')
        },
    });

    return (
        <div className="login-page">
            <h1>Login</h1>
            <button onClick={handleGoogleLogin}>Login with Google</button>
        </div>
    );
}

export default LoginPage;
