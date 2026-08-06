import { VnPlayer } from '../../vn';
import { s37_ev25_25 } from '../../vn/scenes/s37/s37_ev25_25';

export default function s37_ev25_25Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev25_25} scriptKey="s37_ev25_25" />
    </div>
  );
}
