export default function getLocationHash() {
  return (window.location.hash || '#').substring(1);
}
