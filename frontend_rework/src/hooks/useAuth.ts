import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { LoginDto, RegisterDto } from '@/types';

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const { setUser, setTokens } = useAuthStore();
  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
    },
  });
}

export function useRegister() {
  const { setUser, setTokens } = useAuthStore();
  return useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: logout,
  });
}
