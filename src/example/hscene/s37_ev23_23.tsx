import { VnPlayer } from '../../vn';
import { s37_ev23_23 } from '../../vn/scenes/s37/s37_ev23_23';

export default function s37_ev23_23Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_ev23_23} scriptKey="s37_ev23_23" />
    </div>
  );
}
