import Image from 'next/image'
import Link from 'next/link'
import { Building2, ChevronRight, Package } from 'lucide-react'
import { OFFICE_SLUGS, OFFICES } from '@/lib/offices'

export default function OfficeSelectorPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <Package className="h-7 w-7 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ระบบเบิกอุปกรณ์</h1>
          <p className="mt-2 text-gray-600">เลือกการไฟฟ้าที่ต้องการใช้งาน</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICE_SLUGS.map((slug) => {
            const office = OFFICES[slug]

            return (
              <Link
                key={office.slug}
                href={`/${office.slug}`}
                className="group flex min-h-28 items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:border-purple-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
              >
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-50 text-purple-600">
                  {office.logo ? (
                    <Image
                      src={office.logo}
                      alt={office.logoAlt ?? `โลโก้ ${office.label}`}
                      fill
                      priority={office.slug === 'pea-kla'}
                      sizes="80px"
                      className="object-cover transition duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      style={{ objectPosition: office.logoPosition }}
                    />
                  ) : (
                    <Building2 className="h-8 w-8" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{office.label}</div>
                  <div className="mt-1 text-sm leading-5 text-gray-600">{office.name}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-purple-600" />
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
