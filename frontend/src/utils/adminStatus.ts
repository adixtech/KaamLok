type Tone = 'brand' | 'teal' | 'amber' | 'neutral' | 'success' | 'danger' | 'warning';

export function statusTone(status: string): Tone {
  switch (status) {
    case 'active':
    case 'approved':
    case 'published':
    case 'accepted':
      return 'success';
    case 'pending':
    case 'draft':
    case 'waitlist':
      return 'amber';
    case 'blocked':
    case 'rejected':
    case 'suspended':
    case 'archived':
      return 'danger';
    case 'shortlisted':
      return 'brand';
    default:
      return 'neutral';
  }
}