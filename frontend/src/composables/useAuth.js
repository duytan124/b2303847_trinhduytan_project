import { useRouter } from 'vue-router';
import { push } from 'notivue';

export function useAuth() {
    const router = useRouter();
    const logOut = () => {
        if (confirm("Xác nhận đăng xuất?")) {
            push.info("Đăng xuất thành công");
            sessionStorage.clear();
            router.push("/")
            setTimeout(() => {
                window.location.reload();
            }, 600);
        }
    };

    return { logOut };
}