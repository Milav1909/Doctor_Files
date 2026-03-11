import Link from "next/link";
import { Shield, Building2, CalendarDays, Stethoscope, Heart } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)] dark:bg-[var(--bg-body)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-indigo-100/40 dark:bg-indigo-900/15 rounded-full blur-3xl" />
        </div>

        <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--text-primary)]">Doctor Files</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full border border-blue-100 dark:border-blue-800 mb-6">
            <Shield className="w-4 h-4" />
            Secure Healthcare Management
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-6">
            Modern Healthcare,<br />
            <span className="text-[var(--primary)]">Simplified</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Book appointments, manage medical records, and connect with healthcare professionals — all in one secure, easy-to-use platform.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-base">
              Create Account
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6 stagger-children">
          {[
            { label: 'Appointments', value: '10K+', icon: <CalendarDays className="w-6 h-6 text-blue-500" /> },
            { label: 'Doctors', value: '200+', icon: <Stethoscope className="w-6 h-6 text-indigo-500" /> },
            { label: 'Patients', value: '5K+', icon: <Heart className="w-6 h-6 text-rose-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <div className="mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Built for Everyone</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">A tailored experience for patients, doctors, and administrators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                title: 'For Patients',
                color: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                items: ['Book appointments online', 'View medical records', 'Track appointment status', 'Find doctors by specialty']
              },
              {
                title: 'For Doctors',
                color: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                items: ['Manage appointments', 'Create medical records', 'Set availability hours', 'View patient history']
              },
              {
                title: 'For Admins',
                color: 'bg-violet-500',
                lightBg: 'bg-violet-50',
                items: ['Monitor all activity', 'Manage user accounts', 'View system statistics', 'Oversee appointments']
              }
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-8 hoverable">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{feature.title}</h3>
                <ul className="space-y-3">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <div className={`w-1.5 h-1.5 rounded-full ${feature.color} flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border-color)] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[var(--text-primary)]">Doctor Files</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">© 2026 Doctor Files. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
            <Link href="/login" className="hover:text-[var(--primary)] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[var(--primary)] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
