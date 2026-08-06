import { VnPlayer } from '../../vn';
import { s37_ev33_33 } from '../../vn/scenes/s37/s37_ev33_33';

export default function s37_ev33_33Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev33_33} scriptKey="s37_ev33_33" />
    </div>
  );
}
