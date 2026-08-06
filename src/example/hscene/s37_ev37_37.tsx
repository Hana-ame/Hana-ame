import { VnPlayer } from '../../vn';
import { s37_ev37_37 } from '../../vn/scenes/s37/s37_ev37_37';

export default function s37_ev37_37Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev37_37} scriptKey="s37_ev37_37" />
    </div>
  );
}
