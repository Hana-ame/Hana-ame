import { VnPlayer } from '../../vn';
import { s37_ev21_21 } from '../../vn/scenes/s37/s37_ev21_21';

export default function s37_ev21_21Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev21_21} scriptKey="s37_ev21_21" />
    </div>
  );
}
