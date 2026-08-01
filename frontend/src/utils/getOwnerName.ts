import Owner from 'src/types/Owner';

export default function getOwnerName(owner?: Owner): string {
  if (!owner) {
    return '';
  }
  return owner.full_name || `${owner.first_name} ${owner.last_name}`;
}
