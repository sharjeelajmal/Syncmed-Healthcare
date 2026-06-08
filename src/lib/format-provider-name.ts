type ProviderNameInput = {
  providerType?: string | null
  user: { firstName: string; lastName: string }
}

function isRegisteredNurse(providerType?: string | null) {
  return providerType === "REGISTERED_NURSE"
}

/** Full display name: "Dr. Jane Doe" or "Jane Doe, RN" */
export function formatProviderDisplayName(provider: ProviderNameInput): string {
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`.trim()
  return isRegisteredNurse(provider.providerType)
    ? `${fullName}, RN`
    : `Dr. ${fullName}`
}

/** Display name from user fields and optional provider type */
export function formatProviderDisplayNameFromUser(
  user: { firstName: string; lastName: string },
  providerType?: string | null
): string {
  return formatProviderDisplayName({ providerType, user })
}
