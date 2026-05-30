import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { authApi } from '../../api/authApi';
import { toast } from 'sonner';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initAuth, setAuthUser } = useAuth();

  // States
  const [status, setStatus] = useState('loading'); // 'loading' | 'linking' | 'error'
  const [linkingData, setLinkingData] = useState(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const linking = searchParams.get('linking');
    const error = searchParams.get('error');

    if (success === 'true') {
      setStatus('loading');
      // Đăng nhập thành công, gọi initAuth để đồng bộ access token in-memory và thông tin user
      initAuth()
        .then(() => {
          toast.success('Đăng nhập thành công!');
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          toast.error('Có lỗi xảy ra khi khôi phục phiên đăng nhập');
          navigate('/login', { replace: true });
        });
    } else if (linking === 'true') {
      setStatus('linking');
      setLinkingData({
        provider: searchParams.get('provider'),
        providerId: searchParams.get('providerId'),
        email: searchParams.get('email'),
        fullName: decodeURIComponent(searchParams.get('fullName') || ''),
        avatarUrl: searchParams.get('avatarUrl') ? decodeURIComponent(searchParams.get('avatarUrl') || '') : null,
      });
    } else if (error) {
      setStatus('error');
      toast.error('Đăng nhập thất bại: ' + decodeURIComponent(error));
      navigate('/login', { replace: true });
    } else {
      // Mặc định chuyển về login nếu không có params hợp lệ
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, initAuth]);

  const handleConfirmLink = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const data = await authApi.confirmLink({
        email: linkingData.email,
        password: password,
        provider: linkingData.provider,
        providerId: linkingData.providerId,
        providerEmail: linkingData.email,
        providerName: linkingData.fullName,
        avatarUrl: linkingData.avatarUrl,
      });

      // Thiết lập thông tin auth thành công
      setAuthUser(data.user);
      toast.success('Liên kết tài khoản thành công!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setErrorMsg('Mật khẩu không khớp. Vui lòng thử lại.');
      } else {
        setErrorMsg(message || 'Liên kết tài khoản thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent" />
          <p className="text-slate-400 font-medium text-base animate-pulse">Đang đồng bộ đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (status === 'linking' && linkingData) {
    const providerName = linkingData.provider === 'GOOGLE' ? 'Google' : 'Facebook';
    const providerColor = linkingData.provider === 'GOOGLE' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5';

    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-950/50">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Liên kết tài khoản</h2>
            <p className="text-slate-400 text-sm mb-6">
              Địa chỉ email <span className="text-indigo-400 font-semibold">{linkingData.email}</span> đã được đăng ký trước đó trên CareerAI.
            </p>

            <div className={`flex items-center gap-3 w-full border rounded-xl p-4 mb-6 ${providerColor}`}>
              {linkingData.avatarUrl ? (
                <img src={linkingData.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full border border-slate-700/50 object-cover" />
              ) : (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 text-white font-bold">
                  {linkingData.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs text-slate-400">Bạn muốn liên kết với</p>
                <p className="text-sm font-semibold text-slate-200">{linkingData.fullName} ({providerName})</p>
              </div>
            </div>

            <form onSubmit={handleConfirmLink} className="w-full text-left">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nhập mật khẩu hiện tại của bạn để xác nhận liên kết:
              </label>
              
              <div className="relative mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu tài khoản CareerAI"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              {errorMsg && (
                <div className="text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mb-6">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium py-3 rounded-xl transition-all cursor-pointer text-center text-sm border border-slate-750"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Đang liên kết...
                    </>
                  ) : (
                    'Xác nhận liên kết'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
