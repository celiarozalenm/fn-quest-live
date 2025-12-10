interface CommunityBadgeCTAProps {
  hasCommunityProfile: boolean
}

export default function CommunityBadgeCTA({ hasCommunityProfile }: CommunityBadgeCTAProps) {
  const handleClick = () => {
    // TODO: Navigate to community profile page or external link
    window.open('https://community.forwardnetworks.com', '_blank')
  }

  return (
    <div className="w-full max-w-4xl bg-[var(--fn-blue-dark)] rounded-2xl p-6 mt-4 flex items-center justify-between">
      <p className="text-white">
        {hasCommunityProfile
          ? 'Congratulation! View your new mission badge in Forward Community now!'
          : 'Congratulations! Set up your Forward community profile to receive the badge!'}
      </p>
      <button className="btn-primary-sm" onClick={handleClick}>
        {hasCommunityProfile ? 'View now!' : 'Set now!'}
      </button>
    </div>
  )
}
