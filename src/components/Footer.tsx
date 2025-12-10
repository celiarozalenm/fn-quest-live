import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <div className="w-full flex justify-center py-4">
      <button
        className="text-white underline hover:text-gray-300 transition-colors"
        onClick={() => navigate('/rules')}
      >
        Quest rules
      </button>
    </div>
  )
}
