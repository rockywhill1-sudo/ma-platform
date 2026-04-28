// Catch-all for /demo/* - render the same demo page so deep-links don't 404
import DemoPage from '../page';

export default function CatchAll() {
  return <DemoPage />;
}
