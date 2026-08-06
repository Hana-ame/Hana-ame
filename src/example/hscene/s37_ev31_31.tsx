import { VnPlayer } from '../../vn';
import { s37_ev31_31 } from '../../vn/scenes/s37/s37_ev31_31';

export default function s37_ev31_31Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev31_31} scriptKey="s37_ev31_31" />
    </div>
  );
}
