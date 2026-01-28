import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <div className="text-center animate-fadeIn">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 mb-8 shadow-2xl shadow-sky-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Doctor Files
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12">
              Your complete healthcare management solution. Book appointments,
              manage medical records, and connect with healthcare professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-primary text-lg px-8 py-4">
                Sign In
              </Link>
              <Link href="/register" className="btn-secondary text-lg px-8 py-4">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            Features for Everyone
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Patient Card */}
          <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Patients</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Search doctors by specialization
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Book appointments online
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> View appointment history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Access medical records
              </li>
            </ul>
          </div>

          {/* Doctor Card */}
          <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Doctors</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span> Manage availability
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span> Approve/reject appointments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span> Create medical records
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span> View patient history
              </li>
            </ul>
          </div>

          {/* Admin Card */}
          <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Admins</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> System overview dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Manage all users
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Monitor appointments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Handle cancellations
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500">
          <p>© 2026 Doctor Files. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
