import { VnPlayer } from '../../vn';
import { s37_ev24_24 } from '../../vn/scenes/s37/s37_ev24_24';

export default function s37_ev24_24Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev24_24} scriptKey="s37_ev24_24" />
    </div>
  );
}
