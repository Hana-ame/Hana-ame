import { VnPlayer } from '../../vn';
import { s37_ev32_32 } from '../../vn/scenes/s37/s37_ev32_32';

export default function s37_ev32_32Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev32_32} scriptKey="s37_ev32_32" />
    </div>
  );
}
