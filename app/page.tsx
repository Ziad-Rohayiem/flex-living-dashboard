// import Dashboard from './components/Dashboard'

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-100">
//       <Dashboard />
//     </main>
//   )
// }

import { redirect } from 'next/navigation'

  export default function Home() {
    redirect('/properties')
}